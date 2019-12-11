import * as ts from "typescript";
import * as lua from "../../../LuaAST";
import { FunctionVisitor } from "../../context";
import { forbiddenForIn } from "../../utils/diagnostics";
import { isArrayType } from "../../utils/typescript";
import { transformIdentifier } from "../identifier";
import { transformLoopBody } from "./body";

export const transformForInStatement: FunctionVisitor<ts.ForInStatement> = (statement, context) => {
    if (isArrayType(context, context.checker.getTypeAtLocation(statement.expression))) {
        context.diagnostics.push(forbiddenForIn(statement));
    }

    // Transpile expression
    const pairsIdentifier = lua.createIdentifier("pairs");
    const expression = context.transformExpression(statement.expression);
    const pairsCall = lua.createCallExpression(pairsIdentifier, [expression]);

    const body = lua.createBlock(transformLoopBody(context, statement));

    // Transform iteration variable
    // TODO: After the transformation pipeline refactor we should look at refactoring this together with the
    // for-of initializer transformation.
    let iterationVariable: lua.Identifier;
    if (
        ts.isVariableDeclarationList(statement.initializer) &&
        ts.isIdentifier(statement.initializer.declarations[0].name)
    ) {
        iterationVariable = transformIdentifier(context, statement.initializer.declarations[0].name);
    } else if (ts.isIdentifier(statement.initializer)) {
        // Iteration variable becomes ____key
        iterationVariable = lua.createIdentifier("____key");
        // Push variable = ____key to the start of the loop body to match TS scoping
        const initializer = lua.createAssignmentStatement(
            transformIdentifier(context, statement.initializer),
            iterationVariable
        );
        body.statements.unshift(initializer);
    } else {
        // TODO:
        throw new Error(`Unsupported for...in variable kind: ${ts.SyntaxKind[statement.initializer.kind]}.`);
    }

    return lua.createForInStatement(body, [iterationVariable], [pairsCall], statement);
};
