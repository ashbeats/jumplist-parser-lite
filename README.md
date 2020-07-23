# THIS README WILL NOT MAKE SENSE UNTIL V1.0.0. 

# REALLY, IT WILL NOT. 

-------------------------------------


# jumplist-parser-lite

https://web.archive.org/web/20190829145904/http://forensicswiki.org/wiki/Jump_Lists



# Resources

https://binaryforay.blogspot.com/2016/02/jump-lists-in-depth-understand-format.html

[Jump lists in depth (includes changes from Windows 10)](https://web.archive.org/web/20190829145904/http://binaryforay.blogspot.com/2016/02/jump-lists-in-depth-understand-format.html), by [Eric Zimmerman](https://web.archive.org/web/20190829145904/http://forensicswiki.org/wiki/Eric_Zimmerman), Feb 2016



## Jump Lists

Jump Lists are a new Windows 7 Taskbar feature that gives the user quick access to recently accessed application files and actions.

Jump Lists come in multiple flavors:

- automatic (autodest, or *.automaticDestinations-ms) files
- custom (custdest, or *.customDestinations-ms) files
- Explorer StartPage2 ProgramsCache Registry values

### AutomaticDestinations

The AutomaticDestinations Jump List files are located in the user profile path:

Path: C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations

Files: *.automaticDestinations-ms

#### Structure

The AutomaticDestinations Jump List files are [OLE Compound Files](https://web.archive.org/web/20190829145904/http://forensicswiki.org/wiki/OLE_Compound_File) containing multiple streams of which:

- hexadecimal numbered, e.g. "1a"
- DestList

Each of the hexadecimal numbered streams contains data similar of that of a [Windows Shortcut (LNK)](https://web.archive.org/web/20190829145904/http://forensicswiki.org/wiki/LNK). One could extract all the streams and analyze them individually with a LNK parser.

The "DestList" stream acts as a most recently/frequently used (MRU/MFU) list. This stream consists of a 32-byte header, followed by the various structures that correspond to each of the individual numbered streams. Each of these structures is 114 bytes in size, followed by a variable length Unicode string. The first 114 bytes of the structure contains the following information at the corresponding offsets:

| Offset |   Size   |                         Description                          |
| :----: | :------: | :----------------------------------------------------------: |
|  0x48  | 16 bytes |  NetBIOS name of the system; padded with zeros to 16 bytes   |
|  0x58  | 8 bytes  | Stream number; corresponds to the numbered stream within the jump list |
|  0x64  | 8 bytes  | Last modification time, contains a [FILETIME](https://web.archive.org/web/20190829145904/http://msdn2.microsoft.com/en-us/library/ms724284.aspx) structure |
|  0x70  | 2 bytes  | Path string size, the number of characters (UTF-16 words) of the path string |
|  0x72  |   ...    |                         Path string                          |

### CustomDestinations

The CustomDestinations Jump List files are located in the user profile path:

Path: C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations

Files: *.customDestinations-ms

#### Structure

CustomDestinations Jump List files reportedly follow a structure of sequential [MS-SHLLINK](https://web.archive.org/web/20190829145904/http://msdn.microsoft.com/en-us/library/dd871305(v=prot.13).aspx:) binary format segments.