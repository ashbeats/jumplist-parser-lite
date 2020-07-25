const lnk = require("@recent-cli/resolve-lnk");

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



const cues_to_lnks = cues => /* @var {Buffer} */ haystack => {
  let x = 0;
  let max = 10;
  let entries = [];
  while (x < max) {
    x++;

    // if last_footer is not found, something is wrong. Might have overshot.
    const last_footer = haystack.lastIndexOf(cues.footerBytes);
    if (!last_footer) break;

    // find the starting pos of lnk header signature
    const start = haystack.indexOf(cues.lnkHeaderBytes);
    if (start === -1) break;

    // find the last pos of footer signature (there are many footers in the file. We all them footer, because the sig is stored at the end of the file)
    let end = haystack.indexOf(cues.footerBytes);
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
};

module.exports = cues_to_lnks;
