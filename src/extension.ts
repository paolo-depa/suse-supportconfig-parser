'use strict';

// src/extension.ts

import * as vscode from 'vscode';

const MIN_RANGE_LENGTH: number = 2;

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            { scheme: "file", language: "suse-supportconfig" },
            new SupportConfigDocumentSymbolProvider()
        )
    );
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            { scheme: "file", language: "suse-supportconfig" },
            new SupportConfigFoldingRangeProvider()
        )
    );
}

class SupportConfigDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {

            const symbols: vscode.DocumentSymbol[] = getSymbols(document);
            resolve(symbols);
        });
    }
}

export class SupportConfigFoldingRangeProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(
        document: vscode.TextDocument,
        context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FoldingRange[]> {
        let ranges: vscode.FoldingRange[] = [];
        var startFoldingRange = -1;

        const symbols: vscode.DocumentSymbol[] = getSymbols(document);

        symbols.forEach(element => {
            ranges.push(new vscode.FoldingRange(element.range.start.line,element.range.end.line));
        });

        return ranges;
    }
}

function getSymbols(document: vscode.TextDocument) {
    const symbols: vscode.DocumentSymbol[] = [];
    const nodes = [symbols];
    let symbol: vscode.DocumentSymbol | null= null;

    for (let i = 0; i < document.lineCount; i++) {
        let line = document.lineAt(i);

        if (line.text.startsWith('#==')) {

            if (symbol != null) {
                setSymbolRangeEnd(symbol, i - 1)
                nodes[nodes.length - 1].push(symbol)
            }

            symbol = createSymbol(document, i);

        }

        if ((i === document.lineCount - 1)  && (symbol != null)){
            setSymbolRangeEnd(symbol, i - 1)
            nodes[nodes.length - 1].push(symbol)
        }

    }

    return symbols

}

function createSymbol(document: vscode.TextDocument, currentLine: number) {

    let symbolkind = vscode.SymbolKind.Function

    var line = document.lineAt(currentLine);
    var nextline = document.lineAt(currentLine + 1)
    var sectionTask = "Null"    // nextline is needed to set the sectionTask accordingly

    if (line.text.startsWith("#=") &&
        nextline.text.startsWith("#=")) {
        return null;
    }

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


    return symbol;
}

function setSymbolRangeEnd(symbol: vscode.DocumentSymbol | null, end: number) {
    if (symbol != null) {
        let range = new vscode.Range(symbol!.range.start, new vscode.Position(end, 0))
        symbol!.range = range;
        symbol!.selectionRange = range;
    }

    return symbol;

}