

const extract_dest_entries  = require("./automatic-destinations/extract_dest_entries.js")


/*
convert entries 
    if (/^[\w]:\\/m.test(dest_entry)) {
      // Entries.add(path.dirname(dest_entry));
    }
 */
module.exports = extract_dest_entries;