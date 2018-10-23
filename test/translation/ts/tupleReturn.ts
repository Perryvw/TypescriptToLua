/** !TupleReturn */
function tupleReturn(): [number, string] {
    return [0, "foobar"];
}
declare function noTupleReturn(): [number, string];
declare function foo(a: [number, string]): void;
tupleReturn();
noTupleReturn();
let [a, b] = tupleReturn();
let [c, d] = noTupleReturn();
[a, b] = tupleReturn();
[c, d] = noTupleReturn();
let e = tupleReturn();
let f = noTupleReturn();
e = tupleReturn();
f = noTupleReturn();
foo(tupleReturn());
foo(noTupleReturn());
/** !TupleReturn */
function tupleReturnFromVar(): [number, string] {
    const r: [number, string] = [1, "baz"];
    return r;
}
/** !TupleReturn */
function tupleReturnForward(): [number, string] {
    return tupleReturn();
}
function tupleNoForward(): [number, string] {
    return tupleReturn();
}
/** !TupleReturn */
function tupleReturnUnpack(): [number, string] {
    return tupleNoForward();
}
