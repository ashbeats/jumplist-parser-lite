

module.exports = function destlist_header(headerBuffer) {
  const Version = headerBuffer.readInt32LE(0);
  const NumberOfEntries = headerBuffer.readInt32LE(4);
  const NumberOfPinnedEntries = headerBuffer.readInt32LE(8);
  const LastEntryNumber = headerBuffer.readInt32LE(16);
  const LastRevisionNumber = headerBuffer.readInt32LE(24);
  return {
    Version,
    NumberOfEntries,
    NumberOfPinnedEntries,
    LastEntryNumber,
    LastRevisionNumber
  };
};
