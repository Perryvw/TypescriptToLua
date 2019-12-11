import * as ts from "typescript";
import { AnnotationKind } from "./annotations";

const createDiagnosticFactory = <TArgs extends any[]>(
    message: string | ((...args: TArgs) => string),
    category = ts.DiagnosticCategory.Error
) => (node: ts.Node, ...args: TArgs): ts.Diagnostic => ({
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getWidth(),
    category,
    code: 0,
    source: "typescript-to-lua",
    messageText: typeof message === "string" ? message : message(...args),
});

export const forbiddenForIn = createDiagnosticFactory(`Iterating over arrays with 'for ... in' is not allowed.`);

export const annotationInvalidArgumentCount = createDiagnosticFactory(
    (kind: AnnotationKind, got: number, expected: number) => `'@${kind}' expects ${expected} arguments, but got ${got}.`
);

export const extensionCannotConstruct = createDiagnosticFactory(
    "Cannot construct classes with '@extension' or '@metaExtension' annotation."
);

export const extensionCannotExtend = createDiagnosticFactory(
    `Cannot extend classes with '@extension' or '@metaExtension' annotation.`
);

export const extensionCannotExport = createDiagnosticFactory(
    `Cannot export classes with '@extension' or '@metaExtension' annotation.`
);

export const extensionInvalidInstanceOf = createDiagnosticFactory(
    `Cannot use instanceof on classes with '@extension' or '@metaExtension' annotation.`
);

export const extensionAndMetaExtensionConflict = createDiagnosticFactory(
    `Cannot use both '@extension' and '@metaExtension' annotations on the same class.`
);

export const metaExtensionMissingExtends = createDiagnosticFactory(
    `'@metaExtension' annotation requires the extension of the metatable class.`
);

export const invalidForRangeCall = createDiagnosticFactory((message: string) => `Invalid @forRange call: ${message}.`);

export const luaTableMustBeAmbient = createDiagnosticFactory(
    "Classes with the '@luaTable' annotation must be ambient."
);

export const luaTableCannotBeExtended = createDiagnosticFactory(
    "Cannot extend classes with the '@luaTable' annotation."
);

export const luaTableInvalidInstanceOf = createDiagnosticFactory(
    "The instanceof operator cannot be used with a '@luaTable' class."
);

export const luaTableForbiddenUsage = createDiagnosticFactory(
    (description: string) => `Invalid @luaTable usage: ${description}.`
);
