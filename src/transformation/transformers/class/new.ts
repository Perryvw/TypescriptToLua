import * as ts from "typescript";
import * as tstl from "../../../LuaAST";
import { FunctionVisitor, TransformationContext } from "../../context";
import { AnnotationKind, getCustomTypeAnnotations } from "../../utils/annotations";
import { InvalidAnnotationArgumentNumber, InvalidNewExpressionOnExtension } from "../../utils/errors";
import { importLuaLibFeature, LuaLibFeature } from "../../utils/lualib";
import { transformArguments } from "../call";

// TODO: Do it in identifier?
function checkForLuaLibType(context: TransformationContext, type: ts.Type): void {
    if (type.symbol) {
        switch (context.checker.getFullyQualifiedName(type.symbol)) {
            case "Map":
                importLuaLibFeature(context, LuaLibFeature.Map);
                return;
            case "Set":
                importLuaLibFeature(context, LuaLibFeature.Set);
                return;
            case "WeakMap":
                importLuaLibFeature(context, LuaLibFeature.WeakMap);
                return;
            case "WeakSet":
                importLuaLibFeature(context, LuaLibFeature.WeakSet);
                return;
        }
    }
}

export const transformNewExpression: FunctionVisitor<ts.NewExpression> = (node, context) => {
    const name = context.transformExpression(node.expression);
    const signature = context.checker.getResolvedSignature(node);
    const params = node.arguments
        ? transformArguments(context, node.arguments, signature)
        : [tstl.createBooleanLiteral(true)];

    const type = context.checker.getTypeAtLocation(node);

    checkForLuaLibType(context, type);

    const annotations = getCustomTypeAnnotations(context, type);

    if (annotations.has(AnnotationKind.Extension) || annotations.has(AnnotationKind.MetaExtension)) {
        throw InvalidNewExpressionOnExtension(node);
    }

    const customConstructorAnnotation = annotations.get(AnnotationKind.CustomConstructor);
    if (customConstructorAnnotation) {
        if (customConstructorAnnotation.args[0] === undefined) {
            throw InvalidAnnotationArgumentNumber("@customConstructor", 0, 1, node);
        }

        return tstl.createCallExpression(
            tstl.createIdentifier(customConstructorAnnotation.args[0]),
            transformArguments(context, node.arguments || []),
            node
        );
    }

    return tstl.createCallExpression(
        tstl.createTableIndexExpression(name, tstl.createStringLiteral("new")),
        params,
        node
    );
};