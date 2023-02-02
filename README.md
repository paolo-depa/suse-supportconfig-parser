# suse-supportconfig-parser

A VS code extension capable of parsing SUSE supportconfig files

## Features

- Folding of sections based on '#===[ XXX ]===# separator
- Outline filling with the sections detected
- Breadcrumbs indicating the section where the cursor is currently within

## Known issues

- There is an open [issue](https://github.com/microsoft/vscode/issues/31078) with VS code letting the extensions only handle files smaller than 50 MBs
  - As a workaround split the supportconfig files or try the [vsc-lfs](https://marketplace.visualstudio.com/items?itemName=mbehr1.vsc-lfs) extension
  
- The extension only register itself for .txt files, being the large majority of the files belonging to a supportconfig; nonetheless ther are two alternative ways to make the extension parse a file not ending with .txt suffix:
  - From the Command Palette (CTRL+SHIFT+P) run "Change Language Mode" and then select "suse-supportconfig": please not this is _NOT_ going to be persistent
  - From the Settings panel (CTRL+,) navigate to "Text Editor" -> "Files" -> "Associations" and add the couple having the prefix/suffix/regexp of your choice as first item and "suse-supportconfig" as the second: i.e. in order to _permanently_ let this extension to parse the ceph related files, add the couple "ceph-*","suse-supportconfig"
