import { TSTLErrors } from "../../src/TSTLErrors";
import * as util from "../util";

const tableLib = `
/** @LuaTable */
declare class Table<K extends {} = {}, V = any> {
    length: number;
    set(key?: K, value?: V): void;
    get(key?: K): V;
    other(): void;
}
declare let tbl: Table;
`;

test("LuaTable set() cannot be used in an expression position", () => {
    expect(() =>
        util.transpileString(tableLib + `const exp = tbl.set("value", 5)`),
    ).toThrowExactError(TSTLErrors.ForbiddenLuaTableSetExpression(util.nodeStub));
});

test("LuaTables can have other properties", () => {
    expect(() => util.transpileString(tableLib + `tbl.other()`)).not.toThrow();
});

test("LuaTable new and length", () => {
    const content = tableLib + `tbl = new Table();\nreturn tbl.length;`;
    const lua = util.transpileString(content);
    expect(util.executeLua(lua)).toEqual(0);
});

test.each([
    [`tbl.get()`, "One parameter is required for get() on a '@LuaTable' object."],
    [`tbl.get("field", "field2")`, "One parameter is required for get() on a '@LuaTable' object."],
    [`tbl.set()`, "Two parameters are required for set() on a '@LuaTable' object."],
    [`tbl.set("field")`, "Two parameters are required for set() on a '@LuaTable' object."],
    [`tbl.set("field", 0, 1)`, "Two parameters are required for set() on a '@LuaTable' object."],
])("Forbidden LuaTable use (%p)", (invalidCode, errorDescription) => {
    expect(() => util.transpileString(tableLib + invalidCode)).toThrowExactError(
        TSTLErrors.ForbiddenLuaTableUseException(util.nodeStub, errorDescription),
    );
});

test.each([
    `class Ext extends Table {}`,
    `const c = class Ext extends Table {}`,
])("Cannot extend LuaTable class (%p)", (code) => {
    expect(() => util.transpileString(tableLib + code)).toThrowExactError(
        TSTLErrors.InvalidExtendsLuaTable(util.nodeStub),
    );
});

test.each([
    `/** @luaTable */ class Table {}`,
    `/** @luaTable */ export class Table {}`,
    `/** @luaTable */ const c = class Table {}`,
])("LuaTable classes must be declared (%p)", (code) => {
    expect(() => util.transpileString(code)).toThrowExactError(
        TSTLErrors.ForbiddenLuaTableNonDeclaration(util.nodeStub),
    );
});