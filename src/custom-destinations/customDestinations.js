/* 
https://github.com/EricZimmerman/JumpList/blob/master/JumpList/Custom/CustomDestination.cs
 */

const fs = require("fs");
const { dd, dump } = require("dumper.js");
const { footerBytes, ByteSearch } = require("./sharedSignatures.js");

const { entry } = require("./entry.js");

const test_file =
  // "../tests/customDestinations/fa9ab6619fa287bf.customDestinations-ms";
  "../tests/customDestinations/48e4d97e866a670a.customDestinations-ms";

function validate_signature(rawBytes) {
  const fileSig = rawBytes.readInt32LE(rawBytes.length - 4);
  const footerSig = footerBytes.readInt32LE(0);
  return footerSig === fileSig;
}

/**
 * CustomDestinations-ms
 * 
 Files created under \Users\<username>\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations-ms are created when a user “pins” a file to the Start Menu or Task Bar.
 
 https://www.blackbagtech.com/blog/windows-10-jump-list-forensics/
 
 * @param {Buffer} rawBytes
 * @param sourceFile
 */
const getFooterOffsets = footerBytes => rawBytes => {
  let index = 0;
  let footerOffsets = [];
  while (index < rawBytes.length) {
    let lo = ByteSearch(rawBytes, footerBytes, index);
    if (lo === -1) {
      break;
    }
    footerOffsets.push(lo);
    index = lo + footerBytes.length; //add length so we do not hit on it again
  }

  return footerOffsets;
};

let footerOffsetReducer = mainBytes => (
  { chunkStart, byteChunks, absOffsets },
  footerOffset,
  i
) => {
  let chunkSize = footerOffset - chunkStart + 4;
  let chunkBytes = Buffer.alloc(chunkSize);
  chunkBytes.set(
    mainBytes.subarray(chunkStart, chunkStart + chunkBytes.length),
    0
  );

  absOffsets.push(chunkStart);
  byteChunks.push(chunkBytes);

  chunkStart += chunkSize;

  return { chunkStart, byteChunks, absOffsets };
};

function custom_destination(rawBytes, sourceFile) {
  // dd("not implemented yet");
  if (rawBytes.length === 0) throw "Empty file";
  if (rawBytes.length <= 24) throw "Empty custom destinations jump list";

  // #. Validate footer signature.
  if (!validate_signature(rawBytes)) throw "Invalid signature (footer missing)";

  const footerOffsets = getFooterOffsets(footerBytes)(rawBytes);

  let reduceState = { chunkStart: 0, byteChunks: [], absOffsets: [] };

  const { byteChunks, absOffsets } = footerOffsets.reduce(
    footerOffsetReducer(rawBytes),
    reduceState
  );

  const entries = byteChunks
    .filter(b => b.length > 30)
    .map((b, i) => entry(b, absOffsets[i]));

  return {
    footerOffsets,
    absOffsets,
    byteChunks: byteChunks.length,
    entries
  };
}

dd(custom_destination(fs.readFileSync(test_file), test_file));
