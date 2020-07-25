

const extract_dest_entries  = require("./automatic-destinations/extract_dest_entries.js")


/*
convert entries 
    if (/^[\w]:\\/m.test(dest_entry)) {
      // Entries.add(path.dirname(dest_entry));
    }
 */

// todo - detect if custom or automatic list and handle transparently.
module.exports = extract_dest_entries;