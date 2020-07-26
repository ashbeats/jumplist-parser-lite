'use strict';
const CFB = require("cfb");

const unpack_destlist_content = require("./unpack_destlist_content.js");

function automatic_destination_parser(bytes) {
  
  if (!(bytes instanceof Buffer)) throw "Input must be an instance of Buffer";
  
  const cfb = CFB.read(bytes, { type: "buffer" });
  
  const DestList = CFB.find(cfb, "DestList");
  if (DestList && "content" in DestList) {
    return unpack_destlist_content(DestList.content);
  }
}

module.exports = automatic_destination_parser;