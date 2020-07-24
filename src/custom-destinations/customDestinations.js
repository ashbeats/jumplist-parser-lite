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

dd(custom_destination(fs.readFileSync(test_file), test_file));
/**
 * CustomDestinations-ms
 * 
 Files created under \Users\<username>\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations-ms are created when a user “pins” a file to the Start Menu or Task Bar.
 
 https://www.blackbagtech.com/blog/windows-10-jump-list-forensics/
 
 * @param {Buffer} rawBytes
 * @param sourceFile
 */
function custom_destination(rawBytes, sourceFile) {
  // dd("not implemented yet");

  if (rawBytes.length === 0) throw "Empty file";
  /*
    var appid = Path.GetFileName(sourceFile).Split('.').FirstOrDefault();
    if (appid != null)
    {
        var aid = new AppIdInfo(appid);
        AppId = aid;
    }
    else
    {
        AppId = new AppIdInfo("Unable to determine AppId");
    }
     */

  if (rawBytes.length <= 24) {
    throw "Empty custom destinations jump list";
  }

  // #. Validate footer signature.
  const fileSig = rawBytes.readInt32LE(rawBytes.length - 4);

  const footerSig = footerBytes.readInt32LE(0);
  if (footerSig !== fileSig) {
    throw "Invalid signature (footer missing)";
  }

  let index = 0;
  let footerOffsets = [];
  while (index < rawBytes.length) {
    let lo = ByteSearch(rawBytes, footerBytes, index);
    if (lo === -1) {
      console.log('lo', lo)
      
      break;
    }
    footerOffsets.push(lo);
    index = lo + footerBytes.length; //add length so we do not hit on it again
  }

  let byteChunks = [];
  let absOffsets = [];
  let chunkStart = 0;

  // todo. use reduce.
  for (let footerOffset of footerOffsets) {
    let chunkSize = footerOffset - chunkStart + 4;
    console.log('chunkSize', chunkSize)
      
    let bytes = Buffer.alloc(chunkSize);
    bytes.set(rawBytes.subarray(chunkStart, chunkStart + bytes.length), 0);
    //
    //    
    // copy(targetBuffer: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number):
    
    
    // rawBytes.copy(
    //     bytes, 0, 
    //     chunkStart, chunkStart + chunkSize
    // );
    
    
    
    absOffsets.push(chunkStart);
    byteChunks.push(bytes);
    chunkStart += chunkSize;
  }

  // todo: https://github.com/EricZimmerman/JumpList/blob/master/JumpList/Custom/Entry.cs
  //   this is a custom data format for the entries.
  //  https://github.com/EricZimmerman/JumpList/blob/7477a4b3b0e3e54ab69b5468959cb6fb1c285e4c/JumpList/Custom/CustomDestination.cs#L87
  const entries = byteChunks
    .filter(b => b.length > 30)
    .map((b, i) => {
      return entry(b, absOffsets[i]);
      
      
    }); // wrong. i++ 

  return {
    fileSig,
    footerSig,
    footerOffsets,
    absOffsets,
    byteChunks: byteChunks.length,
    entries
  };
}
