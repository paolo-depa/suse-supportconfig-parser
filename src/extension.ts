'use strict';

// src/extension.ts

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            { scheme: "file", language: "suse-supportconfig" },
            new SupportConfigDocumentSymbolProvider()
        )
    );
}

class SupportConfigDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            const symbols: vscode.DocumentSymbol[] = [];
            const nodes = [symbols]

            var symbolkind = vscode.SymbolKind.Function

            // Loop until the last-but one row
            for (let i = 0; i < document.lineCount - 1; i++) {
                var line = document.lineAt(i);
                var nextline = document.lineAt(i + 1)
                var sectionTask = "Null"    // nextline is needed to set the sectionTask accordingly

                if (line.text.startsWith("#=") &&
                    !nextline.text.startsWith("#=")) { // going to the leaf in "nested" structures

                    // sectionType matches the content between square brackets of '#==[ XXXXXXX ]=====================#'
                    var regex = /(#=*\[ )([\w\s]*)(\]=*#)/
                    const sectionType = line.text.replace(regex, "$2")

                    switch (sectionType.trim()) {
                        case "Command":
                            symbolkind = vscode.SymbolKind.Enum
                            break;

                        case "Configuration File":
                        case "Log File":
                            symbolkind = vscode.SymbolKind.File
                            break;

                        case "System":
                            symbolkind = vscode.SymbolKind.Function
                            break;

                        case "Summary":
                            symbolkind = vscode.SymbolKind.Array
                            break;

                        case "Verification":
                            symbolkind = vscode.SymbolKind.Event
                            break;

                        case "Note":
                            symbolkind = vscode.SymbolKind.Constant
                            break;

                        default:
                            symbolkind = vscode.SymbolKind.Function
                            break;
                    }

                    // Setting sectionTask from the line below '#==[ XXXXXXX ]=====================#'
                    if (!nextline.isEmptyOrWhitespace) {
                        regex = /(# )(.*)/
                        sectionTask = nextline.text.replace(regex, "$2")
                    }

                    const symbol = new vscode.DocumentSymbol(
                        sectionTask,
                        sectionType,
                        symbolkind,
                        line.range, line.range)

                    nodes[nodes.length - 1].push(symbol)
                }
            }

            resolve(symbols);
        });
    }
}