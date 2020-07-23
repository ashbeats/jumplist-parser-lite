

const DEFAULT_ENCODING = "utf16le"; // utf-16
/**
 *
 * @param {Buffer} rawBytes
 * @returns {string}
 */
module.exports = function extract_path_from_dest_list_entry(rawBytes) {
  const v3PathLen = rawBytes.readInt16LE(128) * 2;
  return rawBytes.toString(DEFAULT_ENCODING, 130, 130 + v3PathLen);
};
