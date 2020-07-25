

const DEFAULT_ENCODING = "utf16le"; // utf-16
/**
 *
 * @param {Buffer} bytes
 * @returns {string}
 */
module.exports = function extract_path_from_dest_list_entry(bytes) {
  const i = 130;
  const len = bytes.readInt16LE(128) * 2;
  return bytes.toString("utf16le", i, i + len);
};
