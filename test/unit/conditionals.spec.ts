import * as tstl from "../../src";
import { TSTLErrors } from "../../src/TSTLErrors";
import * as util from "../util";

test.each([0, 1])("if (%p)", inp => {
    util.testFunction`
        let input: number = ${inp};
        if (input === 0) {
            return 0;
        }
        return 1;
    `.expectToMatchJsResult();
});

test.each([0, 1])("ifelse (%p)", inp => {
    util.testFunction`
        let input: number = ${inp};
        if (input === 0) {
            return 0;
        } else {
            return 1;
        }
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("ifelseif (%p)", inp => {
    util.testFunction`
        let input: number = ${inp};
        if (input === 0) {
            return 0;
        } else if (input === 1){
            return 1;
        } else if (input === 2){
            return 2;
        }
        return 3;
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("ifelseifelse (%p)", inp => {
    util.testFunction`
        let input: number = ${inp};
        if (input === 0) {
            return 0;
        } else if (input === 1){
            return 1;
        } else if (input === 2){
            return 2;
        } else {
            return 3;
        }
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("switch (%p)", inp => {
    util.testFunction`
        let result: number = -1;

        switch (<number>${inp}) {
            case 0:
                result = 0;
                break;
            case 1:
                result = 1;
                break;
            case 2:
                result = 2;
                break;
        }
        return result;
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("switchdefault (%p)", inp => {
    util.testFunction`
        let result: number = -1;

        switch (<number>${inp}) {
            case 0:
                result = 0;
                break;
            case 1:
                result = 1;
                break;
            case 2:
                result = 2;
                break;
            default:
                result = -2;
                break;
        }
        return result;
    `.expectToMatchJsResult();
});

test.each([0, 0, 2, 3, 4, 5, 7])("switchfallthrough (%p)", inp => {
    util.testFunction`
        let result: number = -1;

        switch (<number>${inp}) {
            case 0:
                result = 0;
            case 1:
                result = 1;
                break;
            case 2:
                result = 2;
            case 3:
            case 4:
                result = 4;
                break;
            case 5:
                result = 5;
            case 6:
                result += 10;
                break;
            case 7:
                result = 7;
            default:
                result = -2;
                break;
        }

        return result;
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("nestedSwitch (%p)", inp => {
    util.testFunction`
        let result: number = -1;

        switch (${inp} as number) {
            case 0:
                result = 0;
                break;
            case 1:
                switch(${inp} as number) {
                    case 0:
                        result = 0;
                        break;
                    case 1:
                        result = 1;
                        break;
                    default:
                        result = -3;
                        break;
                }
                break;
            case 2:
                result = 2;
                break;
            default:
                result = -2;
                break;
        }
        return result;
    `.expectToMatchJsResult();
});

test.each([0, 1, 2])("switchLocalScope (%p)", inp => {
    util.testFunction`
        let result: number = -1;

        switch (<number>${inp}) {
            case 0: {
                let x = 0;
                result = 0;
                break;
            }
            case 1: {
                let x = 1;
                result = x;
            }
            case 2: {
                let x = 2;
                result = x;
                break;
            }
        }
        return result;
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("switchReturn (%p)", inp => {
    util.testFunction`
        const result: number = -1;

        switch (<number>${inp}) {
            case 0:
                return 0;
                break;
            case 1:
                return 1;
            case 2:
                return 2;
                break;
        }
        return result;
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("switchWithBrackets (%p)", inp => {
    util.testFunction`
        let result: number = -1;

        switch (<number>${inp}) {
            case 0: {
                result = 0;
                break;
            }
            case 1: {
                result = 1;
                break;
            }
            case 2: {
                result = 2;
                break;
            }
        }
        return result;
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("switchWithBracketsBreakInConditional (%p)", inp => {
    util.testFunction`
        let result: number = -1;

        switch (<number>${inp}) {
            case 0: {
                result = 0;
                break;
            }
            case 1: {
                result = 1;

                if (result == 1) break;
            }
            case 2: {
                result = 2;
                break;
            }
        }
        return result;
    `.expectToMatchJsResult();
});

test.each([0, 1, 2, 3])("switchWithBracketsBreakInInternalLoop (%p)", inp => {
    util.testFunction`
        let result: number = -1;

        switch (${inp} as number) {
            case 0: {
                result = 0;

                for (let i = 0; i < 5; i++) {
                    result++;

                    if (i >= 2) {
                        break;
                    }
                }
            }
            case 1: {
                result++;
                break;
            }
            case 2: {
                result = 2;
                break;
            }
        }
        return result;
    `.expectToMatchJsResult();
});

test("If dead code after return", () => {
    util.testFunction`
        if (true) {
            return 3;
            const b = 8;
        }
    `.expectToMatchJsResult();
});

test("switch dead code after return", () => {
    util.testFunction`
        switch ("abc" as string) {
            case "def":
                return 4;
                let abc = 4;
            case "abc":
                return 5;
                let def = 6;
        }
    `.expectToMatchJsResult();
});

test("switch not allowed in 5.1", () => {
    util.testFunction`
        switch ("abc") {}
    `
        .setOptions({ luaTarget: tstl.LuaTarget.Lua51 })
        .expectToHaveDiagnosticOfError(
            TSTLErrors.UnsupportedForTarget("Switch statements", tstl.LuaTarget.Lua51, util.nodeStub)
        );
});
