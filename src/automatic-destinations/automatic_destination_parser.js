

const CFB = require("cfb");


const unpack_destlist_content = require("./unpack_destlist_content.js");

function automatic_destination_parser(jmpPath) {
  const cfb = CFB.read(jmpPath, { type: "file" });
  const DestList = CFB.find(cfb, "DestList");
  if (DestList && "content" in DestList) {
    return unpack_destlist_content(DestList.content);
  }
}



module.exports = automatic_destination_parser

