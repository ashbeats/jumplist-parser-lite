const not_empty        = e => e.length > 0;
const distance         = (hay, needles) => hay.length - needles.length;
const isHaystackBigger = (a, b) => a.length >= b.length;


function loop(bag, iterations){
  
  
  
  
}


/**
 *
 * @param {Buffer} searchInHaystack
 * @param {Buffer} searchNeedleBytes
 * @param {number} start
 * @returns {number}
 * @constructor
 */
function ByteSearch(searchIn, searchBytes, start = 0) {
  let found = -1;
  let matched = false;
  //only look at this if we have a populated search array and search bytes with a sensible start
    console.log('start', start)
    console.log('searchBytes', searchBytes)
    
    
  let searchableScope = distance(searchIn, searchBytes);
  // let truthy =
  //   [
  //     not_empty(searchInHaystack),
  //     not_empty(searchNeedleBytes),
  //     start <= searchableScope,
  //     isHaystackBigger(searchInHaystack, searchNeedleBytes)
  //   ].filter(e => e).length === 4;

  if (
    searchIn.length > 0 &&
    searchBytes.length > 0 &&
    start <= searchIn.length - searchBytes.length &&
    searchIn.length >= searchBytes.length
  ) {
    //iterate through the array to be searched
    for (let i = start; i <= searchIn.length - searchBytes.length; i++) {
      //if the start bytes match we will start comparing all other bytes
      if (searchIn[i] === searchBytes[0]) {
        if (searchIn.length > 1) { 
          // # 
          //compare byte by byte
          matched = true;
          for (let y = 1; y <= searchBytes.length - 1; y++) {
            if (searchIn[i + y] !== searchBytes[y]) {
              matched = false;
              break;
            }
          }

          if (matched) {
            found = i;
            break;
          }
        } else {
          //search byte is only one bit. get out now
          found = i;
          break; //stop the loop
        }
      }
    }
  }
  return found;
}

// prettier-ignore
const footerBytes = [
    0xab, 0xfb, 0xbf, 0xba
];

// prettier-ignore
const lnkHeaderBytes  = [ 
    0x4C, 0x00, 0x00, 0x00,
    0x01, 0x14, 0x02, 0x00, 
    0x00, 0x00, 0x00, 0x00,
    0xC0, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x46
];

module.exports["footerBytes"] = Buffer.from(footerBytes);
module.exports["lnkHeaderBytes"] = Buffer.from(lnkHeaderBytes);
module.exports["ByteSearch"] = ByteSearch;
