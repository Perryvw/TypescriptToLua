import * as util from "../../util";

test("set constructor", () => {
    util.testFunction`
        let myset = new Set();
        return myset.size;
    `.expectToMatchJsResult();
});

test("set iterable constructor", () => {
    util.testFunction`
        let myset = new Set(["a", "b"]);
        return myset.has("a") || myset.has("b");
    `.expectToMatchJsResult();
});

test("set iterable constructor set", () => {
    util.testFunction`
        let myset = new Set(new Set(["a", "b"]));
        return myset.has("a") || myset.has("b");
    `.expectToMatchJsResult();
});

test("set add", () => {
    util.testFunction`
        let myset = new Set();
        myset.add("a");
        return myset.has("a");
    `.expectToMatchJsResult();
});

test("set clear", () => {
    util.testFunction`
        let myset = new Set(["a", "b"]);
        myset.clear();
        return { size: myset.size, has: !myset.has("a") && !myset.has("b") };
    `.expectToMatchJsResult();
});

test("set delete", () => {
    util.testFunction`
        let myset = new Set(["a", "b"]);
        myset.delete("a");
        return myset.has("b") && !myset.has("a");
    `.expectToMatchJsResult();
});

test("set entries", () => {
    util.testFunction`
        let myset = new Set([5, 6, 7]);
        let count = 0;
        for (var [key, value] of myset.entries()) { count += key + value; }
        return count;
    `.expectToMatchJsResult();
});

test("set foreach", () => {
    util.testFunction`
        let myset = new Set([2, 3, 4]);
        let count = 0;
        myset.forEach(i => { count += i; });
        return count;
    `.expectToMatchJsResult();
});

test("set foreach keys", () => {
    util.testFunction`
        let myset = new Set([2, 3, 4]);
        let count = 0;
        myset.forEach((value, key) => { count += key; });
        return count;
    `.expectToMatchJsResult();
});

test("set has", () => {
    util.testFunction`
        let myset = new Set(["a", "c"]);
        return myset.has("a");
    `.expectToMatchJsResult();
});

test("set has false", () => {
    util.testFunction`
        let myset = new Set();
        return myset.has("a");
    `.expectToMatchJsResult();
});

test("set has null", () => {
    util.testFunction`
        let myset = new Set(["a", "c"]);
        return myset.has(null);
    `.expectToMatchJsResult();
});

test("set keys", () => {
    util.testFunction`
        let myset = new Set([5, 6, 7]);
        let count = 0;
        for (var key of myset.keys()) { count += key; }
        return count;
    `.expectToMatchJsResult();
});

test("set values", () => {
    util.testFunction`
        let myset = new Set([5, 6, 7]);
        let count = 0;
        for (var value of myset.values()) { count += value; }
        return count;
    `.expectToMatchJsResult();
});

test.each([
    `let m = new Set()`,
    `let m = new Set(); m.add(1)`,
    `let m = new Set([1, 2])`,
    `let m = new Set([1, 2]); m.clear()`,
    `let m = new Set([1, 2]); m.delete(2)`,
])("set size (%p)", code => {
    util.testFunction`${code}; return m.size`.expectToMatchJsResult();
});

const testSetConstructionCode = `
    const myset = new Set();

    myset.add("x");
    myset.add("a");
    myset.add(4);
    myset.add("b");
    myset.add(1);

    myset.delete("b");`;

test("set.entries() preserves insertion order", () => {
    util.testFunction`
        ${testSetConstructionCode}

        return [...myset.entries()];
    `
        .expectToMatchJsResult()
        .expectToEqual([["x", "x"], ["a", "a"], [4, 4], [1, 1]]);
});

test("set.keys() preserves insertion order", () => {
    util.testFunction`
        ${testSetConstructionCode}

        return [...myset.keys()];
    `
        .expectToMatchJsResult()
        .expectToEqual(["x", "a", 4, 1]);
});

test("set.values() preserves insertion order", () => {
    util.testFunction`
        ${testSetConstructionCode}

        return [...myset.values()];
    `
        .expectToMatchJsResult()
        .expectToEqual(["x", "a", 4, 1]);
});
