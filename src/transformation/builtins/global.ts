import * as ts from "typescript";
import * as tstl from "../../LuaAST";
import { TransformationContext } from "../context";
import { transformArguments } from "../transformers/call";
import { LuaLibFeature, transformLuaLibFunction } from "../utils/lualib";
import { isNumberType } from "../utils/typescript";

export function transformGlobalFunctionCall(
    context: TransformationContext,
    node: ts.CallExpression
): tstl.Expression | undefined {
    const signature = context.checker.getResolvedSignature(node);
    const parameters = transformArguments(context, node.arguments, signature);
    const expressionType = context.checker.getTypeAtLocation(node.expression);
    const name = expressionType.symbol.name;
    switch (name) {
        case "SymbolConstructor":
            return transformLuaLibFunction(context, LuaLibFeature.Symbol, node, ...parameters);
        case "NumberConstructor":
            return transformLuaLibFunction(context, LuaLibFeature.Number, node, ...parameters);
        case "isNaN":
        case "isFinite":
            const numberParameters = isNumberType(context, expressionType)
                ? parameters
                : [transformLuaLibFunction(context, LuaLibFeature.Number, undefined, ...parameters)];

            return transformLuaLibFunction(
                context,
                name === "isNaN" ? LuaLibFeature.NumberIsNaN : LuaLibFeature.NumberIsFinite,
                node,
                ...numberParameters
            );
    }
}