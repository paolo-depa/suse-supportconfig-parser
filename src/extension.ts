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

            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);

                if (line.text.startsWith("#=")) {
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

                    var sectionTask = "Null"
                    if (i < document.lineCount - 1) {
                        // There is at least another line after #=====...
                        var nextline = document.lineAt(i + 1)
                        if (!nextline.isEmptyOrWhitespace) {
                            regex = /(# )(.*)/
                            sectionTask = nextline.text.replace(regex, "$2")
                        }
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