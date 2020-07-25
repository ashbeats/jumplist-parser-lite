const cues_to_lnks = require("./cues_to_lnks.js");
const cues = require("./cues.js");

/**
Files created under \Users\<username>\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations-ms are created when a user “pins” a file to the Start Menu or Task Bar.
 
 https://www.blackbagtech.com/blog/windows-10-jump-list-forensics/
 
Custom destinations jump lists work more or less the same way as auto jmps, but custom jump lists do not have DestList information.

https://binaryforay.blogspot.com/2016/02/jump-lists-in-depth-understand-format.html

Custom destinations
One way a custom destination file (*.customDestinations-ms) is created is when a user pins an item in a jump list. 

They can be found in the following directory:
C:\Users\%USER%\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations
*/

const compare_with_fixed_cues = cues => bytes => {
  const fileSig = bytes.readInt32LE(bytes.length - 4);
  const footerSig = cues.footerBytes.readInt32LE(0);
  return footerSig === fileSig;
};

/**
 *
 * @param {Object} cues
 * @returns {function(Buffer): {destinations: []}}
 */
function custom_destination_parser(cues) {
  //A custom destination jump list file generally looks like this internally:
  //
  // - Header
  // -  Series of lnk files concatenated together
  // - Other stuff
  // - Footer (Signature 0xbabffbab)

  const extract = cues_to_lnks(cues);
  const isValid = compare_with_fixed_cues(cues);

  return bytes => {
    if (!(bytes instanceof Buffer)) throw "Input must be an instance of Buffer";
    if (bytes.length === 0) throw "Empty file";
    if (bytes.length <= 24) throw "Empty custom destinations jump list";
    if (!isValid(bytes)) throw "Invalid signature (footer missing)";

    // pull out the unique destinations
    return [...new Set(extract(bytes))]
  };
}

/***
 * INLINE TESTS
 */
/*
const fs = require("fs");
const test_file =
  // "../tests/customDestinations/fa9ab6619fa287bf.customDestinations-ms";
  "../tests/customDestinations/48e4d97e866a670a.customDestinations-ms";

console.log(custom_destination_parser(cues)(fs.readFileSync(test_file), test_file));
*/

module.exports = custom_destination_parser(cues);
