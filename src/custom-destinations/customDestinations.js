/* 
https://github.com/EricZimmerman/JumpList/blob/master/JumpList/Custom/CustomDestination.cs
 */
const lnk = require("@recent-cli/resolve-lnk");
const fs = require("fs");
const { dd, dump } = require("dumper.js");
const { footerBytes, ByteSearch } = require("./sharedSignatures.js");
const shared = require("./sharedSignatures.js");

const { entry } = require("./entry.js");

function validate_signature(rawBytes) {
  const fileSig = rawBytes.readInt32LE(rawBytes.length - 4);
  const footerSig = footerBytes.readInt32LE(0);
  return footerSig === fileSig;
}

const getFooterOffsets = searchFn => threads => haystack => {
  let index = 0;
  let footerOffsets = [];
  while (index < haystack.length) {
    let lo = searchFn(haystack, threads, index);
    if (lo === -1) {
      break;
    }
    footerOffsets.push(lo);
    index = lo + threads.length; //add length so we do not hit on it again
  }

  return footerOffsets;
};

let footerOffsetReducer = mainBytes => (
  { chunkStart, byteChunks },
  footerOffset,
  i
) => {
  //4C 00 00 00 01 14 02 00 00 00 00 00 C0 00 00 00 00 00 00 46
  // where the first 4 bytes are the header length and the next 16 make up our GUID.

  // where the first 4 bytes are the header length and the next 16 make up our GUID.

  //  If we can find the offset to each of those, we have the offsets where each lnk file starts.

  // This fn receives the where each one starts:
  // Since we know where each starts, we can then start at the first one and use the offset
  // to the second to calculate how many bytes is in the first lnk file.

  let size = footerOffset - chunkStart + 4;
  let bytes = Buffer.alloc(size);
  bytes.set(mainBytes.subarray(chunkStart, chunkStart + size), 0);
  byteChunks.push(bytes);

  chunkStart += size;

  return { chunkStart, byteChunks };
};

/**
 * CustomDestinations-ms
 * 
 Files created under \Users\<username>\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations-ms are created when a user “pins” a file to the Start Menu or Task Bar.
 
 https://www.blackbagtech.com/blog/windows-10-jump-list-forensics/
 
 * @param {Buffer} rawBytes
 */

/*
Custom destinations jump lists work more or less the same way, but custom jump lists do not have DestList information.

https://binaryforay.blogspot.com/2016/02/jump-lists-in-depth-understand-format.html

Custom destinations
One way a custom destination file (*.customDestinations-ms) is created is when a user pins an item in a jump list. Harlan spoke of this way back in 2011.

They can be found in the following directory:

C:\Users\<UserProfile>\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations

A custom destination jump list file generally looks like this internally:
 - Header
 - Series of lnk files concatenated together
- (Possibly other data structures in there)
 - Footer (Signature 0xbabffbab)


So now all a parser has to do is understand how to pull out the lnk files from  *.customDestinations-ms files and you 
can extract all the details contained in said lnk files using the tool of your choice.

Nice, but how can we know where the lnk files start and stop? It would have been nice if each was prefixed with the 
number of bytes so that we could read that size and then read that number of bytes. Alas, this is just a dream.

The way I process custom destination files is to look for a few unique things about lnk files amongst the sea of bytes:

Header length: 0x4C
Lnk class Identifier GUID: 00021401-0000-0000-c000-000000000046

One thing you might notice is that the bytes that make up the GUID aren't in the same order in the lnk file itself. 

Because of this, we have to look for a pattern in the bytes that looks like this:

4C 00 00 00 01 14 02 00 00 00 00 00 C0 00 00 00 00 00 00 46

where the first 4 bytes are the header length and the next 16 make up our GUID. 

If we can find the offset to each of those, we have the offsets where each lnk file starts. Since we know where each 
starts, we can then start at the first one and use the offset to the second to calculate how many bytes is in the 
first lnk file. This works fine until we get to the last one. For this one, we need to find the offset to the footer
 and use this offset along with the starting offset of the last lnk file to find the number of bytes in the last 
 lnk file.

And that is how custom destination jump lists are stored on disk. 

 */

function custom_destination(rawBytes) {
  //A custom destination jump list file generally looks like this internally:
  //
  // - Header
  // -  Series of lnk files concatenated together
  // - Other stuff
  // Footer (Signature 0xbabffbab)

  // dd("not implemented yet");
  if (rawBytes.length === 0) throw "Empty file";
  if (rawBytes.length <= 24) throw "Empty custom destinations jump list";

  // #. Validate footer signature.
  if (!validate_signature(rawBytes)) throw "Invalid signature (footer missing)";

  // So now all a parser has to do is understand how to pull out the lnk files from  *.customDestinations-ms files and you
  // can extract all the details contained in said lnk files using the tool of your choice.

  /*how can we know where the lnk files start and stop?
  * 
  * The way I process custom destination files is to look for a few unique things about lnk files amongst the sea of bytes:
  
  Header length: 0x4C
  Lnk class Identifier GUID: 00021401-0000-0000-c000-000000000046
  * 
  One thing you might notice is that the bytes that make up the GUID aren't in the same order in the lnk file itself. Because of this, we have to look for a pattern in the bytes that looks like this:
  
  4C 00 00 00 01 14 02 00 00 00 00 00 C0 00 00 00 00 00 00 46
  
  where the first 4 bytes are the header length and the next 16 make up our GUID.
  
  If we can find the offset to each of those, we have the offsets where each lnk file starts. 
 
  * Since we know where each starts, we can then start at the first one and use the offset to the second to calculate 
    how many bytes is in the first lnk file. 
    
  * This works fine until we get to the last one. For this one, we need to find the offset to the footer and use this
     offset along with the starting offset of the last lnk file to find the number of bytes in the last lnk file.
  
  * 
  * */

  // const footerOffsets = getFooterOffsets(ByteSearch)(footerBytes)(rawBytes);
  let searchFn = ByteSearch;
  let chunkToFind = footerBytes;
  let haystack = rawBytes;

  let index = 0;
  let footerOffsets = [];
  while (index < haystack.length) {
    // OFFSETS_WHERE_EACH_LNK_FILE_STARTS
    // find the starting position of each lnk entry
    // 4C 00 00 00 01 14 02 00 00 00 00 00 C0 00 00 00 00 00 00 46
    // where the first 4 bytes are the header length and the next 16 make up our GUID.
    let haystackPos = searchFn(haystack, chunkToFind, index);
    if (haystackPos === -1) {
      break;
    }
    footerOffsets.push(haystackPos);
    index = haystackPos + chunkToFind.length; //add length so we do not hit on it again
  }

  // i fucking love Node.Buffer. Now the hype makes sense to me. This is the power.
  dump(["haystack.length", haystack.length]);
  // then get the first position.

  // now search
  let x = 0;
  while (x < 5) {
    x++;
    let start = haystack.indexOf(shared.lnkHeaderBytes);

    if (start === -1) break;

    let last_footer = haystack.lastIndexOf(shared.footerBytes);
    let end = haystack.indexOf(shared.footerBytes);

    if (end === 0) end = last_footer;

    let slice = haystack.subarray(start, end);

    let tried;
     // tried = entry(slice);
     
    tried =  lnk.resolve_lnk_basic(slice)
    
    
    // haystack = haystack.fill(0, start, end);

    // get the next bytes
    haystack = haystack.subarray(end);

    dump([
      "match",
      {
        start,
        end,
        slice_len: slice.length,
        last_footer,
        tried: tried
      }
    ]);
  }

  /* let lnkChunks = [];
  let chunkStart = 0;
  let matchIndex = haystack.indexOf(chunkToFind); // 1928
  let size = matchIndex - chunkStart + 4;
  // footerOffset + 4
  let bytes = Buffer.alloc(size);

  let cp = haystack.subarray(0, 0 + size);
  let cp2 = haystack.subarray(matchIndex + 4, 0 + size);

  bytes.set(
    /!* this is why he has to filter > 30 *!/
    cp,
    0
  );

  // alt method: copy, fill that with 0 in the source, and continue;

  lnkChunks.push(bytes);

  chunkStart += size;

  return { chunkStart, byteChunks };*/

  return;

  // return footerOffsets;

  const { byteChunks } = footerOffsets.reduce(footerOffsetReducer(rawBytes), {
    chunkStart: 0,
    byteChunks: [],
    absOffsets: []
  });

  const entries = byteChunks.filter(b => b.length > 30).map((b, i) => entry(b));

  return {
    entries
  };
}

/***
 * INLINE TESTS
 */

const test_file =
  // "../tests/customDestinations/fa9ab6619fa287bf.customDestinations-ms";
  "../tests/customDestinations/48e4d97e866a670a.customDestinations-ms";

dd(custom_destination(fs.readFileSync(test_file), test_file));
