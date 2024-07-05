const g = {
  Boolean: Boolean,
  Number: Number,
  Infinity: Infinity,
  NaN: NaN,
  Symbol: Symbol,
  String: String,
  RegExp: RegExp,
  Object: Object,
  Array: Array,
  Date: Date,
  Function: Function,
  Map: Map,
  Set: Set,
  WeakMap: WeakMap,
  WeakSet: WeakSet,

  Uint8Array: Uint8Array,
  Uint16Array: Uint16Array,
  Uint32Array: Uint32Array,
  ArrayBuffer: ArrayBuffer,
  Float32Array: Float32Array,
  Float64Array: Float64Array,
  Int8Array: Int8Array,
  Int16Array: Int16Array,
  Int32Array: Int32Array,
  
  Error: Error,
  TypeError: TypeError,
  SyntaxError: SyntaxError,
  URIError: URIError,
  RangeError: RangeError,
  ReferenceError: ReferenceError,
  
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  
  Math: Math,
  JSON: JSON,
  Promise: Promise,
  Proxy: Proxy,
  Reflect: Reflect,
  
  console, console,
  isFinite: isFinite,
  isNaN: isNaN,
  decodeURI: decodeURI,
  encodeURI: encodeURI,
  decodeURIComponent: decodeURIComponent,
  encodeURIComponent: encodeURIComponent,
};

/* eslint no-useless-concat:0 */
// 将关键字拆分，避免递归require自身
module.exports = g['w' + 'indow'] = g['g' + 'lobal'] = g['s' + 'elf'] = g;