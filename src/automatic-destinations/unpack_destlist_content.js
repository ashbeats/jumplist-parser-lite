"use strict";

const destlist_header = require("./destlist_header.js");
const extract_path_from_dest_list_entry = require("./extract_path_from_dest_list_entry.js");

const path = require("path");


module.exports = function unpack_destlist_content(rawBytes) {
  const headerBytes = Buffer.alloc(32);
  headerBytes.set(rawBytes.subarray(0, 32), 0);
  const Header = destlist_header(headerBytes);
  if (Header.Version < 3) {
    throw "Sorry. I don't support versions older than windows 10";
  }

  let Entries = new Set();
  let index = 32;
  let pathSize = 0;
  let entrySize = 0;

  while (index < rawBytes.length) {
    pathSize = rawBytes.readInt16LE(index + 128);
    //128 is offset to the string, 2 for the size itself, double path for unicode, then 4 extra at the end
    entrySize = 128 + 2 + pathSize * 2 + 4;
    const EntryBytes1 = Buffer.alloc(entrySize);
    EntryBytes1.set(rawBytes.subarray(index, index + entrySize), 0);

    const dest_entry = extract_path_from_dest_list_entry(EntryBytes1);
    if (/^[\w]:\\/m.test(dest_entry)) {
      // Entries.add(path.dirname(dest_entry));
    }
    Entries.add(path.dirname(dest_entry));
    index += entrySize;
  }

  return [...Entries];
};
