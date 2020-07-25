const lnk = require("@recent-cli/resolve-lnk");

/* 4C 00 00 00 01 14 02 00 00 00 00 00 C0 00 00 00 00 00 00 46 */
const cues_to_lnks = cues => /* {Buffer} */ haystack => {
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
