const shared = require("./sharedSignatures.js");

// custom dest are containers with multiple lnk files, so i can use the lnk project
const lnk = require("@recent-cli/resolve-lnk");
const decode_lnk_string = require("@recent-cli/resolve-lnk/src/decode_lnk_string.js");

function entry(rawBytes, entryOffset) {
  
  
  let LnkFiles = [];
  let lnkBytes = [];

  let bag = {};
  let rank = rawBytes.readFloatLE(4); // should be single.
  let headerType = rawBytes.readInt32LE(12);
  bag["rank"] = rank;
  bag["headerType"] = headerType;

  if (headerType === 0) {
    let nameSize = rawBytes.readInt16LE(16);
    bag["name"] = decode_lnk_string(
      // encoding, bytes, index, count
      "utf8",
      // 2 bytes + size pos.
      rawBytes,
      18,
      nameSize * 2
    );
  }

  
  let lnkOffsets = [];
  let index = 0;

  const footerPos = shared.ByteSearch(rawBytes, shared.footerBytes, index);
  while (index < rawBytes.length) {
    // todo - rewrite-byte search as headsearch and foot_search
    const lo = shared.ByteSearch(rawBytes, shared.lnkHeaderBytes, index);

    if (lo === -1) {
      break;
    }

    lnkOffsets.push(lo);

    index = lo + 1; //add length so we do not hit on it again
  }

  bag["lnkOffsets"] = lnkOffsets;

  let counter = 0;
  let max = lnkOffsets.length - 1;
  for (let lnkOffset of lnkOffsets) {
    let start = 0;
    let end = 0;

    if (counter === max) {
      //last one, so we need to use footerpos
      start = lnkOffset;
      end = footerPos;
    } else {
      start = lnkOffset;
      end = lnkOffsets[counter + 1];
    }

    // var bytes = new byte[end - start]();
    // Buffer.BlockCopy(rawBytes, start, bytes, 0, bytes.Length);

    let bytes = Buffer.alloc(end - start);
    bytes.set(rawBytes.subarray(start, start + bytes.length), 0);
   
    let name = `Offset_0x${entryOffset + lnkOffset}.lnk`;
    
    lnkBytes.push({
      name: name,
      bytes: bytes,
    });
    
   const lnnk__ =  lnk.resolve_lnk_basic(bytes)
    
    console.log("lnnk__", lnnk__);
   
    LnkFiles.push(lnnk__);
    bag[name] = lnnk__;
    
  }

  console.log("bag", bag);

  return bag;
}

module.exports = {
  entry
};
