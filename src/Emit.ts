import * as path from "path";
import * as ts from "typescript";
import { CompilerOptions, LuaLibImportKind } from "./CompilerOptions";
import { EmitHost, TranspiledFile } from "./Transpile";
import { normalizeSlashes, trimExtension } from "./utils";
import { getProjectRootDir } from "./resolve";

export interface OutputFile {
    name: string;
    text: string;
}

let lualibContent: string;
export function emitTranspiledFiles(
    program: ts.Program,
    options: CompilerOptions,
    transpiledFiles: TranspiledFile[],
    emitHost: EmitHost = ts.sys
): OutputFile[] {
    let { outDir, luaLibImport } = options;

    const rootDir = getProjectRootDir(program);
    outDir = outDir ? path.resolve(rootDir, outDir) : rootDir;

    const files: OutputFile[] = [];
    for (const { fileName, lua, sourceMap, declaration, declarationMap } of transpiledFiles) {
        let outPath = fileName;
        if (outDir !== rootDir) {
            outPath = path.resolve(outDir, path.relative(rootDir, fileName));
        }

        // change extension
        outPath = normalizeSlashes(trimExtension(outPath) + ".lua");

        if (lua !== undefined) {
            files.push({ name: outPath, text: lua });
        }

        if (sourceMap !== undefined && options.sourceMap) {
            files.push({ name: outPath + ".map", text: sourceMap });
        }

        if (declaration !== undefined) {
            files.push({ name: trimExtension(outPath) + ".d.ts", text: declaration });
        }

        if (declarationMap !== undefined) {
            files.push({ name: trimExtension(outPath) + ".d.ts.map", text: declarationMap });
        }
    }

    if (luaLibImport === LuaLibImportKind.Require || luaLibImport === LuaLibImportKind.Always) {
        if (lualibContent === undefined) {
            const lualibBundle = emitHost.readFile(path.resolve(__dirname, "../dist/lualib/lualib_bundle.lua"));
            if (lualibBundle !== undefined) {
                lualibContent = lualibBundle;
            } else {
                throw new Error("Could not load lualib bundle from ./dist/lualib/lualib_bundle.lua");
            }
        }

        let outPath = path.resolve(rootDir, "lualib_bundle.lua");
        if (outDir !== rootDir) {
            outPath = path.join(outDir, path.relative(rootDir, outPath));
        }

        files.push({ name: normalizeSlashes(outPath), text: lualibContent });
    }

    return files;
}
