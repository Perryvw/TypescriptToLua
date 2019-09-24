import * as ts from "typescript";
import * as tstl from "../LuaAST";
import { LuaLibFeature } from "../LuaLib";
import { getOrUpdate } from "../utils";
import { ObjectVisitor, TransformationContext, TransformerPlugin, VisitorMap } from "./context";
import { standardPlugins } from "./transformers";
import { TranspileError } from "./utils/errors";
import { getUsedLuaLibFeatures } from "./utils/lualib";

export { TransformerPlugin } from "./context";

const transpileErrorDiagnostic = (error: TranspileError): ts.Diagnostic => ({
    file: error.node.getSourceFile(),
    start: error.node.getStart(),
    length: error.node.getWidth(),
    category: ts.DiagnosticCategory.Error,
    code: 0,
    source: "typescript-to-lua",
    messageText: error.message,
});

export function createVisitorMap(customPlugins: TransformerPlugin[]): VisitorMap {
    const visitorMap: VisitorMap = new Map();
    for (const plugin of [...standardPlugins, ...customPlugins]) {
        for (const [syntaxKindKey, visitor] of Object.entries(plugin.visitors)) {
            if (!visitor) continue;

            const syntaxKind = Number(syntaxKindKey) as ts.SyntaxKind;
            const visitors = getOrUpdate(visitorMap, syntaxKind, () => []);

            const objectVisitor: ObjectVisitor<any> = typeof visitor === "function" ? { transform: visitor } : visitor;
            visitors.push(objectVisitor);
        }
    }

    for (const visitors of visitorMap.values()) {
        visitors.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }

    return visitorMap;
}

export interface TransformSourceFileResult {
    luaAst: tstl.Block;
    luaLibFeatures: Set<LuaLibFeature>;
    diagnostics: ts.Diagnostic[];
}

export function transformSourceFile(
    program: ts.Program,
    sourceFile: ts.SourceFile,
    visitorMap: VisitorMap
): TransformSourceFileResult {
    const context = new TransformationContext(program, sourceFile, visitorMap);

    try {
        const [luaAst] = context.transformNode(sourceFile) as [tstl.Block];
        const luaLibFeatures = getUsedLuaLibFeatures(context);

        return { luaAst, luaLibFeatures, diagnostics: [] };
    } catch (error) {
        if (!(error instanceof TranspileError)) throw error;

        return {
            luaAst: tstl.createBlock([
                tstl.createExpressionStatement(
                    tstl.createCallExpression(tstl.createIdentifier("error"), [tstl.createStringLiteral(error.message)])
                ),
            ]),
            luaLibFeatures: new Set(),
            diagnostics: [transpileErrorDiagnostic(error)],
        };
    }
}