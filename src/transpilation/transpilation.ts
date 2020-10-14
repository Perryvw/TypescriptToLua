import { Resolver, ResolverFactory } from "enhanced-resolve";
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { CompilerOptions, isBundleEnabled, LuaTarget } from "../CompilerOptions";
import { getLuaLibBundle } from "../LuaLib";
import { assert, cast, isNonNull, normalizeSlashes, trimExtension } from "../utils";
import { Chunk, modulesToBundleChunks, modulesToChunks } from "./chunk";
import { createResolutionErrorDiagnostic } from "./diagnostics";
import { buildModule, Module } from "./module";
import { getPlugins, Plugin } from "./plugins";
import { Transpiler, TranspilerHost } from "./transpiler";

export class Transpilation {
    public readonly diagnostics: ts.Diagnostic[] = [];
    public modules: Module[] = [];

    public options = this.program.getCompilerOptions() as CompilerOptions;
    public rootDir: string;
    public outDir: string;
    public host: TranspilerHost;

    private readonly implicitScriptExtensions = [".ts", ".tsx", ".js", ".jsx"] as const;
    protected resolver: Resolver;
    public plugins: Plugin[];

    constructor(public transpiler: Transpiler, public program: ts.Program, extraPlugins: Plugin[]) {
        this.host = transpiler.host;

        this.rootDir =
            // getCommonSourceDirectory ignores provided rootDir when TS6059 is emitted
            this.options.rootDir == null
                ? program.getCommonSourceDirectory()
                : ts.getNormalizedAbsolutePath(this.options.rootDir, this.host.getCurrentDirectory());

        this.outDir = this.options.outDir ?? this.rootDir;

        this.resolver = ResolverFactory.createResolver({
            extensions: [".lua", ...this.implicitScriptExtensions],
            conditionNames: ["lua", `lua:${this.options.luaTarget ?? LuaTarget.Universal}`],
            fileSystem: this.host.resolutionFileSystem ?? fs,
            useSyncFileSystemCalls: true,
        });

        this.plugins = getPlugins(this, extraPlugins);
    }

    public emit(): Chunk[] {
        this.modules.forEach(module => this.buildModule(module));

        const lualibRequired = this.modules.some(m => m.code.toString().includes('require("lualib_bundle")'));
        if (lualibRequired) {
            const fileName = normalizeSlashes(path.resolve(this.rootDir, "lualib_bundle.lua"));
            this.modules.unshift({ request: fileName, code: getLuaLibBundle(this.host), isBuilt: true });
        }

        return this.mapModulesToChunks(this.modules);
    }

    private buildModule(module: Module) {
        buildModule(module, request => {
            let resolvedModule: Module;
            try {
                resolvedModule = this.resolveRequestToModule(module.request, request);
            } catch (error) {
                this.diagnostics.push(createResolutionErrorDiagnostic(error.message, request, module.request));
                return { error: error.message };
            }

            return this.getModuleId(resolvedModule);
        });
    }

    private resolveRequestToModule(issuer: string, request: string) {
        const resolvedPath = this.resolver.resolveSync({}, path.dirname(issuer), request);
        assert(typeof resolvedPath === "string", `Invalid resolution result: ${resolvedPath}`);

        let module = this.modules.find(m => m.request === resolvedPath);
        if (!module) {
            if (
                this.implicitScriptExtensions.some(extension => resolvedPath.endsWith(extension)) ||
                resolvedPath.endsWith(".json")
            ) {
                throw new Error(`Resolved source file '${resolvedPath}' is not a part of the project.`);
            }

            // TODO: Load source map files
            module = {
                request: resolvedPath,
                code: cast(this.host.readFile(resolvedPath), isNonNull),
                isBuilt: false,
            };

            this.modules.push(module);
            this.buildModule(module);
        }

        return module;
    }

    public getModuleId(module: Module) {
        const result = path.relative(this.rootDir, trimExtension(module.request));
        // TODO: handle files on other drives
        assert(!path.isAbsolute(result), `Invalid path: ${result}`);
        return result
            .replace(/\.\.[/\\]/g, "_/")
            .replace(/\./g, "__")
            .replace(/[/\\]/g, ".");
    }

    private mapModulesToChunks(modules: Module[]): Chunk[] {
        return isBundleEnabled(this.options) ? modulesToBundleChunks(this, modules) : modulesToChunks(this, modules);
    }
}