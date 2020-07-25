// prettier-ignore
const footerBytes = Buffer.from([
    0xab, 0xfb, 0xbf, 0xba
]);

// prettier-ignore
const lnkHeaderBytes  = Buffer.from([ 
    0x4C, 0x00, 0x00, 0x00,
    0x01, 0x14, 0x02, 0x00, 
    0x00, 0x00, 0x00, 0x00,
    0xC0, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x46
]);

const cues = {
  footerBytes,
  lnkHeaderBytes
};

module.exports = cues;