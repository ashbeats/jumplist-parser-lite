

const CFB = require("cfb");

// todo - impure
const unpack_destlist_content = require("./unpack_destlist_content.js");

function extract_dest_entries(jmpPath) {
  const cfb = CFB.read(jmpPath, { type: "file" });
  const DestList = CFB.find(cfb, "DestList");
  if (DestList && "content" in DestList) {
    return unpack_destlist_content(DestList.content);
  }
}



module.exports = extract_dest_entries

