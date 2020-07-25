

const automatic_destination_parser  = require("./automatic-destinations/automatic_destination_parser.js")
const custom_destination_parser  = require("./custom-destinations/custom_destinations.js")


/*
convert entries 
    if (/^[\w]:\\/m.test(dest_entry)) {
      // Entries.add(path.dirname(dest_entry));
    }
 */

// todo - detect if custom or automatic list and handle transparently.

const defaults = {
    /* set this to null to retrieve all types of destinations, or pass your own filter */
    filter: /^[\w]:\\/m,
}


module.exports = {
    automatic_destination_parser,
    custom_destination_parser,
};