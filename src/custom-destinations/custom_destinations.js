/* 
https://github.com/EricZimmerman/JumpList/blob/master/JumpList/Custom/CustomDestination.cs
 */

const cues_to_lnks = require("./cues_to_lnks.js");
const cues = require("./cues.js");

const compare_with_fixed_cues = cues => rawBytes => {
  const fileSig = rawBytes.readInt32LE(rawBytes.length - 4);
  const footerSig = cues.footerBytes.readInt32LE(0);
  return footerSig === fileSig;
};

/**
Files created under \Users\<username>\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations-ms are created when a user “pins” a file to the Start Menu or Task Bar.
 
 https://www.blackbagtech.com/blog/windows-10-jump-list-forensics/
 
Custom destinations jump lists work more or less the same way as auto jmps, but custom jump lists do not have DestList information.

https://binaryforay.blogspot.com/2016/02/jump-lists-in-depth-understand-format.html

Custom destinations
One way a custom destination file (*.customDestinations-ms) is created is when a user pins an item in a jump list. 

They can be found in the following directory:
C:\Users\<UserProfile>\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations
*/

/**
 *
 * @param cues
 * @returns {function(*=): {destinations: []}}
 */
function custom_destination_parser(cues) {
  //A custom destination jump list file generally looks like this internally:
  //
  // - Header
  // -  Series of lnk files concatenated together
  // - Other stuff
  // Footer (Signature 0xbabffbab)

  const extract = cues_to_lnks(cues);
  const isValid = compare_with_fixed_cues(cues);

  /**
   *
   * @param {Buffer} rawBytes
   * @returns {{destinations: []}}
   */
  const parser = rawBytes => {
    if (rawBytes.length === 0) throw "Empty file";
    if (rawBytes.length <= 24) throw "Empty custom destinations jump list";

    // #. Validate footer signature.
    if (!isValid(rawBytes)) throw "Invalid signature (footer missing)";

    // pull out the lnk files
    return {
      destinations: extract(rawBytes)
    };
  };

  return parser;
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
