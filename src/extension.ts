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

        const symbols: vscode.DocumentSymbol[] = getSymbols(document);
        const ranges: vscode.FoldingRange[] = symbols
            .filter(symbol => symbol.range.end.line - symbol.range.start.line >= MIN_RANGE_LENGTH)
            .map(symbol => new vscode.FoldingRange(symbol.range.start.line, symbol.range.end.line));
        return ranges;

    }
}

function getSymbols(document: vscode.TextDocument) {
    const symbols: vscode.DocumentSymbol[] = [];

    let symbol: vscode.DocumentSymbol | null = null;

    for (let i = 0; i < document.lineCount; i++) {
        let line = document.lineAt(i);

        if (line.text.startsWith('#==')) {

            if (symbol != null) {
                setSymbolRangeEnd(symbol, i - 1);
                symbols.push(symbol);
            }

            symbol = createSymbol(document, i);

        }

        if (i === document.lineCount - 1 && symbol != null) {
            setSymbolRangeEnd(symbol, i);
            symbols.push(symbol);
        }

    }

    return symbols;

}

function createSymbol(document: vscode.TextDocument, currentLine: number) {
    let symbolKind = vscode.SymbolKind.Function;
    let sectionTask = "Null";

    let line = document.lineAt(currentLine);
    let nextLine = document.lineAt(currentLine + 1);

    if (line.text.startsWith("#=") && nextLine.text.startsWith("#=")) {

        return null;
    }


    let regex = /(#=*\[ )([\w\s]*)(\]=*#)/;
    let sectionType = line.text.replace(regex, "$2");

    switch (sectionType.trim()) {
        case "Command":
            symbolKind = vscode.SymbolKind.Enum;
            break;

        case "Configuration File":
        case "Log File":
            symbolKind = vscode.SymbolKind.File;
            break;

        case "System":
            symbolKind = vscode.SymbolKind.Function;
            break;

        case "Summary":
            symbolKind = vscode.SymbolKind.Array;
            break;

        case "Verification":
            symbolKind = vscode.SymbolKind.Event;
            break;

        case "Note":
            symbolKind = vscode.SymbolKind.Constant;
            break;

        default:
            symbolKind = vscode.SymbolKind.Function;
            break;
    }

    if (!nextLine.isEmptyOrWhitespace) {
        regex = /(# )(.*)/;
        sectionTask = nextLine.text.replace(regex, "$2");
    }

    return new vscode.DocumentSymbol(
        sectionTask,
        sectionType,
        symbolKind,
        line.range,
        line.range
    );

}

function setSymbolRangeEnd(symbol: vscode.DocumentSymbol | null, end: number) {
    if (symbol != null) {
        symbol.range = new vscode.Range(symbol.range.start, new vscode.Position(end, 0));

        symbol.selectionRange = symbol.range;
    }

    return symbol;
}

