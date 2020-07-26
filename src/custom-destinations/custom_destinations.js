const cues_to_lnks = require("./cues_to_lnks.js");
const cues = require("./cues.js");

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

module.exports =  custom_destination_parser(cues);