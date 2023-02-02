# suse-supportconfig-parser

A VS code extension capable of parsing SUSE supportconfig files

## Features

- Folding of sections based on '#===[ XXX ]===# separator
- Outline filling with the sections detected
- Breadcrumbs indicating the section where the cursor is currently within

## Known issues

- There is an open [issue](https://github.com/microsoft/vscode/issues/31078) with VS code letting the extensions only handle files smaller than 50 MBs
  - As a workaround split the supportconfig files or try the https://marketplace.visualstudio.com/items?itemName=mbehr1.vsc-lfs
