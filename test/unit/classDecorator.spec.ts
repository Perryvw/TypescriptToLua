import * as util from "../util";

test("Class decorator with no parameters", () => {
    const source = `
    function SetBool<T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            decoratorBool = true;
        }
    }

    @SetBool
    class TestClass {
        public decoratorBool = false;
    }

    const classInstance = new TestClass();
    return classInstance.decoratorBool;
    `;

    const result = util.transpileAndExecute(source);
    expect(result).toBe(true);
});

test("Class decorator with parameters", () => {
    const source = `
    function SetNum(this: void, numArg: number) {
        return <T extends new(...args: any[]) => {}>(constructor: T) => {
            return class extends constructor {
                decoratorNum = numArg;
            };
        };
    }

    @SetNum(420)
    class TestClass {
        public decoratorNum;
    }

    const classInstance = new TestClass();
    return classInstance.decoratorNum;
    `;

    const result = util.transpileAndExecute(source);
    expect(result).toBe(420);
});

test("Class decorator with variable parameters", () => {
    const source = `
    function SetNumbers(this: void, ...numArgs: number[]) {
        return <T extends new(...args: any[]) => {}>(constructor: T) => {
            return class extends constructor {
                decoratorNums = new Set<number>(numArgs);
            };
        };
    }

    @SetNumbers(120, 30, 54)
    class TestClass {
        public decoratorNums;
    }

    const classInstance = new TestClass();
    let sum = 0;
    for (const value of classInstance.decoratorNums) {
        sum += value;
    }
    return sum;
    `;

    const result = util.transpileAndExecute(source);
    expect(result).toBe(204);
});

test("Multiple class decorators", () => {
    const source = `
    function SetTen<T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            decoratorTen = 10;
        }
    }

    function SetNum(this: void, numArg: number) {
        return <T extends new(...args: any[]) => {}>(constructor: T) => {
            return class extends constructor {
                decoratorNum = numArg;
            };
        };
    }

    @SetTen
    @SetNum(410)
    class TestClass {
        public decoratorTen;
        public decoratorNum;
    }

    const classInstance = new TestClass();
    return classInstance.decoratorNum + classInstance.decoratorTen;
    `;

    const result = util.transpileAndExecute(source);
    expect(result).toBe(420);
});

test("Class decorator with inheritance", () => {
    const source = `
    function SetTen<T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            decoratorTen = 10;
        }
    }

    function SetNum(this: void, numArg: number) {
        return <T extends new(...args: any[]) => {}>(constructor: T) => {
            return class extends constructor {
                decoratorNum = numArg;
            };
        };
    }

    class TestClass {
        public decoratorTen = 0;
        public decoratorNum = 0;
    }

    @SetTen
    @SetNum(410)
    class SubTestClass extends TestClass {}

    const classInstance = new SubTestClass();
    return classInstance.decoratorNum + classInstance.decoratorTen;
    `;

    const result = util.transpileAndExecute(source);
    expect(result).toBe(420);
});

test("Class decorators are applied in reverse order", () => {
    const source = `
    const order = [];

    function SetString(this: void, stringArg: string) {
        order.push("eval " + stringArg);
        return <T extends new (...args: any[]) => {}>(constructor: T) => {
            order.push("execute " + stringArg);
            return class extends constructor {
                decoratorString = stringArg;
            };
        };
    }

    @SetString("the quick brown fox")
    @SetString("jumped")
    @SetString("over the lazy dog")
    class TestClass {
        public static decoratorString = "";
    }

    const inst = new TestClass();
    return order.join(" ");
    `;

    const result = util.transpileAndExecute(source);
    expect(result).toBe("eval the quick brown fox eval jumped eval over the lazy dog execute over the lazy dog execute jumped execute the quick brown fox");
});