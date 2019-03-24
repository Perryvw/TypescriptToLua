import * as util from "../../../util";
import { LuaTarget, LuaLibImportKind } from "../../../../src/CompilerOptions";

test.each([LuaTarget.LuaJIT, "jit", "JiT"])("Options luaTarget case-insensitive (%p)", target => {
    const options = { luaTarget: target as LuaTarget };
    const result = util.transpileString("~a", options);

    expect(result).toBe("bit.bnot(a);");
});

test.each([LuaLibImportKind.None, "none", "NoNe"])(
    "Options luaLibImport case-insensitive (%p)",
    importKind => {
        const options = { luaLibImport: importKind as LuaLibImportKind };
        const result = util.transpileString("const a = new Map<string, string>();", options);

        expect(result).toBe("local a = Map.new();");
    },
);
