declare let x: number;
declare let y: number;
declare let z: number;
declare let obj: {prop: number};
declare function getObj(): typeof obj;
declare let arr: number[];
declare function getArr(): typeof arr;
declare function getIndex(): number;
declare let xTup: [number, number];
declare let yTup: [number, number];
declare function getTup(): [number, number];
/** !TupleReturn */
declare function getTupRet(): [number, number];
x = y;
x = obj.prop;
x = arr[0];
x = y = obj.prop;
x = obj.prop;
obj.prop = x;
arr[0] = x;
obj.prop = arr[0];
obj.prop = arr[0] = x;
xTup = getTup();
xTup = getTupRet();
[xTup[1], xTup[0]] = getTup();
[xTup[1], xTup[0]] = getTupRet();
xTup = [yTup[1], yTup[0]];
[xTup[0], xTup[1]] = [yTup[1], yTup[0]];
++x;
x++;
--x;
x--;
x += y;
x -= y;
x *= y;
y /= x;
y %= x;
y **= x;
x |= y;
x &= y;
x ^= y;
x <<= y;
x >>= y;
++obj.prop;
obj.prop++;
--obj.prop;
obj.prop--;
obj.prop += arr[0];
obj.prop -= arr[0];
obj.prop *= arr[0];
arr[0] /= obj.prop;
arr[0] %= obj.prop;
arr[0] **= obj.prop;
obj.prop |= arr[0];
obj.prop &= arr[0];
obj.prop ^= arr[0];
obj.prop <<= arr[0];
obj.prop >>= arr[0];
++arr[getIndex()];
arr[getIndex()]--;
++getObj().prop;
getObj().prop++;
--getObj().prop;
getObj().prop--;
getObj().prop += getArr()[getIndex()];
getObj().prop -= getArr()[getIndex()];
getObj().prop *= getArr()[getIndex()];
getArr()[getIndex()] /= getObj().prop;
getArr()[getIndex()] %= getObj().prop;
getArr()[getIndex()] **= getObj().prop;
getObj().prop |= getArr()[getIndex()];
getObj().prop &= getArr()[getIndex()];
getObj().prop ^= getArr()[getIndex()];
getObj().prop <<= getArr()[getIndex()];
getObj().prop >>= getArr()[getIndex()];
z = x = y;
z = obj.prop = x;
z = getObj().prop = x;
z = arr[0] = x;
z = getArr()[getIndex()] = x;
z = x = obj.prop;
z = x = getObj().prop;
z = x = arr[0];
z = x = arr[getIndex()];
z = x = getArr()[getIndex()];
z = ++x;
z = x++;
z = --x;
z = x--;
z = x += y;
z = x -= y;
z = x *= y;
z = y /= x;
z = y %= x;
z = y **= x;
z = x |= y;
z = x &= y;
z = x ^= y;
z = x <<= y;
z = x >>= y;
z = x + (y += 7);
z = x + (y += 7);
z = x++ + (y += 7);
z = ++obj.prop;
z = obj.prop++;
z = --obj.prop;
z = obj.prop--;
z = obj.prop += arr[0];
z = obj.prop -= arr[0];
z = obj.prop *= arr[0];
z = arr[0] /= obj.prop;
z = arr[0] %= obj.prop;
z = arr[0] **= obj.prop;
z = obj.prop |= arr[0];
z = obj.prop &= arr[0];
z = obj.prop ^= arr[0];
z = obj.prop <<= arr[0];
z = obj.prop >>= arr[0];
z = obj.prop + (arr[0] += 7);
z = obj.prop += (arr[0] += 7);
z = obj.prop++ + (arr[0] += 7);
z = ++getObj().prop;
z = getObj().prop++;
z = --getObj().prop;
z = getObj().prop--;
z = getObj().prop += getArr()[getIndex()];
z = getObj().prop -= getArr()[getIndex()];
z = getObj().prop *= getArr()[getIndex()];
z = getArr()[getIndex()] /= getObj().prop;
z = getArr()[getIndex()] %= getObj().prop;
z = getArr()[getIndex()] **= getObj().prop;
z = getObj().prop |= getArr()[getIndex()];
z = getObj().prop &= getArr()[getIndex()];
z = getObj().prop ^= getArr()[getIndex()];
z = getObj().prop <<= getArr()[getIndex()];
z = getObj().prop >>= getArr()[getIndex()];
z = getObj().prop + (getArr()[getIndex()] += 7);
z = getObj().prop += (getArr()[getIndex()] += 7);
z = getObj().prop++ + (getArr()[getIndex()] += 7);
