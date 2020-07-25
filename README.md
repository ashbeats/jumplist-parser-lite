# Jumplist Parser Lite

A safe & non-forensic, Jumplist parser.

JumpList Parser Lite has only one goal - **Find all unique paths inside jumplists.** 

![CI](https://github.com/ashbeats/jumplist-parser-lite/workflows/CI/badge.svg?branch=master&event=push)

## Installation

```bash
yarn add @recent-cli/jumplist-parser-lite
```


## Usage

For Automatic destination files

```javascript
const { automatic_destination_parser } = require("@recent-cli/jumplist-parser-lite");

// bytes should contain a Buffer containing the target file. 
const array_of_destinations = automatic_destination_parser(bytes);
console.log(array_of_destinations);
```

For Custom destination files

```javascript
const { custom_destination_parser } = require("@recent-cli/jumplist-parser-lite");

// bytes should contain a Buffer containing the target file. 
const array_of_destinations = custom_destination_parser(bytes);
console.log(array_of_destinations);
```

See `tests/` for more usage information. 


## So, What are Jumplists?

Jump Lists are a Windows feature that gives the user quick access to recently accessed application files and actions.

Jump Lists come in 2 main types:

- automatic (autodest, or *.automaticDestinations-ms) files
- custom (custdest, or *.customDestinations-ms) files


## Reason for this package

##### Pure NodeJS parser & non-forensic use case

I wanted something that could be included in packages that does not raise privacy concerns and auto flagging by vulnerability scanner bots, like my `@recent-cli` tool. Also, relying on compiled libraries was not ideal for my use case.

Unlike forensic Jumplist parsers which seek to identify and extract all meta-data that can be used to infer user's activity and patterns, *<u>No user identifiable information is returned</u>* from **JumpList Parser Lite**. Only destinations.

Don't get me wrong. 

Forensic tools have a place, just not in widely used *non-forensic* open-source packages. 

If you are looking for a forensic parser, I recommend [Eric Zimmerman's awesome JLECmd](https://github.com/EricZimmerman/JLECmd). It's a great tool for researchers and security consultants. (I can't thank Eric's code enough. It helped me to write this parser)



## References

- [Forensics Wiki On Jumplists](https://web.archive.org/web/20190829145904/http://forensicswiki.org/wiki/Jump_Lists)
- [Jump lists in depth (includes changes from Windows 10)](https://web.archive.org/web/20190829145904/http://binaryforay.blogspot.com/2016/02/jump-lists-in-depth-understand-format.html), by [Eric Zimmerman](https://github.com/EricZimmerman)


