/* 
https://github.com/EricZimmerman/JumpList/blob/master/JumpList/Custom/CustomDestination.cs
 */
const lnk = require("@recent-cli/resolve-lnk");
const fs = require("fs");
const { dd, dump } = require("dumper.js");

// prettier-ignore
const footerBytes = Buffer.from([
    0xab, 0xfb, 0xbf, 0xba
]);

// prettier-ignore
const lnkHeaderBytes  = Buffer.from([ 
    0x4C, 0x00, 0x00, 0x00,
    0x01, 0x14, 0x02, 0x00, 
    0x00, 0x00, 0x00, 0x00,
    0xC0, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x46
]);

const signatures = {
  footerBytes,
  lnkHeaderBytes
};

const validate_signature = rawBytes => {
  const fileSig = rawBytes.readInt32LE(rawBytes.length - 4);
  const footerSig = signatures.footerBytes.readInt32LE(0);
  return footerSig === fileSig;
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

  //
  if (rawBytes.length === 0) throw "Empty file";
  if (rawBytes.length <= 24) throw "Empty custom destinations jump list";

  // #. Validate footer signature.
  if (!validate_signature(rawBytes)) throw "Invalid signature (footer missing)";

  // pull out the lnk files
  return {
    destinations: extract_all_entries(rawBytes)
  };
}

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
function extract_all_entries(haystack) {
  let x = 0;
  let max = 10;
  let entries = [];
  while (x < max) {
    x++;

    // if last_footer is not found, something is wrong. Might have overshot.
    const last_footer = haystack.lastIndexOf(signatures.footerBytes);
    if (!last_footer) break;

    // find the starting pos of lnk header signature
    const start = haystack.indexOf(signatures.lnkHeaderBytes);
    if (start === -1) break;

    // find the last pos of footer signature (there are many footers in the file. We all them footer, because the sig is stored at the end of the file)
    let end = haystack.indexOf(signatures.footerBytes);
    if (end === 0) end = last_footer;
    if (end === -1) break;

    // get the region we found.
    let slice = haystack.subarray(start, end);

    // Found it.
    entries.push(lnk.resolve_lnk_basic(slice));

    // Only keep the rest of the file.
    haystack = haystack.subarray(end);
  }

  return entries;
}

/***
 * INLINE TESTS
 */

const test_file =
  // "../tests/customDestinations/fa9ab6619fa287bf.customDestinations-ms";
  "../tests/customDestinations/48e4d97e866a670a.customDestinations-ms";

dd(custom_destination(fs.readFileSync(test_file), test_file));
