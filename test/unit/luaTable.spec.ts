import { TSTLErrors } from "../../src/TSTLErrors";
import * as util from "../util";

const tableLibClass = `
/** @LuaTable */
declare class Table<K extends {} = {}, V = any> {
    length: number;
    constructor(notAllowed?: boolean);
    set(key?: K, value?: V): void;
    get(key?: K): V;
    other(): void;
}
declare let tbl: Table;
`;

const tableLibInterface = `
/** @LuaTable */
declare interface Table<K extends {} = {}, V = any> {
    length: number;
    constructor(notAllowed?: boolean);
    set(key?: K, value?: V): void;
    get(key?: K): V;
    other(): void;
}
declare let tbl: Table;
`;

test.each([tableLibClass])("LuaTables cannot be constructed with arguments", tableLib => {
    expect(() =>
        util.transpileString(tableLib + `const table = new Table(true);`),
    ).toThrowExactError(
        TSTLErrors.ForbiddenLuaTableUseException(
            util.nodeStub,
            "No parameters are allowed when constructing a LuaTable object.",
        ),
    );
});

test.each([tableLibClass, tableLibInterface])(
    "LuaTable set() cannot be used in an expression position",
    tableLib => {
        expect(() =>
            util.transpileString(tableLib + `const exp = tbl.set("value", 5)`),
        ).toThrowExactError(TSTLErrors.ForbiddenLuaTableSetExpression(util.nodeStub));
    },
);

test.each([tableLibClass, tableLibInterface])("LuaTables can have other methods", tableLib => {
    expect(() => util.transpileString(tableLib + `tbl.other()`)).not.toThrow();
});

test.each([tableLibClass])("LuaTable new", tableLib => {
    const content = tableLib + `tbl = new Table();`;
    expect(util.transpileString(content)).toEqual("tbl = {}");
});

test.each([tableLibClass])("LuaTable length", tableLib => {
    const content = tableLib + `tbl = new Table();\nreturn tbl.length;`;
    const lua = util.transpileString(content);
    expect(util.executeLua(lua)).toEqual(0);
});

test.each([tableLibClass, tableLibInterface])("Cannot set LuaTable length", tableLib => {
    expect(() => util.transpileString(tableLib + `tbl.length = 2;`)).toThrowExactError(
        TSTLErrors.ForbiddenLuaTableUseException(
            util.nodeStub,
            "A LuaTable object's length cannot be re-assigned.",
        ),
    );
});

test.each([tableLibClass, tableLibInterface])("Forbidden LuaTable use", tableLib => {
    test.each([
        [`tbl.get()`, "One parameter is required for get() on a '@LuaTable' object."],
        [
            `tbl.get("field", "field2")`,
            "One parameter is required for get() on a '@LuaTable' object.",
        ],
        [`tbl.set()`, "Two parameters are required for set() on a '@LuaTable' object."],
        [`tbl.set("field")`, "Two parameters are required for set() on a '@LuaTable' object."],
        [
            `tbl.set("field", 0, 1)`,
            "Two parameters are required for set() on a '@LuaTable' object.",
        ],
    ])("Forbidden LuaTable use (%p)", (invalidCode, errorDescription) => {
        expect(() => util.transpileString(tableLib + invalidCode)).toThrowExactError(
            TSTLErrors.ForbiddenLuaTableUseException(util.nodeStub, errorDescription),
        );
    });
});

test.each([tableLibClass])("Cannot extend LuaTable class", tableLib => {
    test.each([`class Ext extends Table {}`, `const c = class Ext extends Table {}`])(
        "Cannot extend LuaTable class (%p)",
        code => {
            expect(() => util.transpileString(tableLib + code)).toThrowExactError(
                TSTLErrors.InvalidExtendsLuaTable(util.nodeStub),
            );
        },
    );
});

test.each([
    `/** @luaTable */ class Table {}`,
    `/** @luaTable */ export class Table {}`,
    `/** @luaTable */ const c = class Table {}`,
])("LuaTable classes must be declared (%p)", code => {
    expect(() => util.transpileString(code)).toThrowExactError(
        TSTLErrors.ForbiddenLuaTableNonDeclaration(util.nodeStub),
    );
});
