/**
 * Converts a string to a number
 */
export function hash(str: string): number {
  var i,
    l,
    hval = 0x811c9dc5;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
  // // Alternative hash function to consider:
  // let h1 = 0xdeadbeef,
  //   h2 = 0x41c6ce57;
  // for (let i = 0, ch; i < string.length; i++) {
  //   ch = string.charCodeAt(i);
  //   h1 = Math.imul(h1 ^ ch, 2654435761);
  //   h2 = Math.imul(h2 ^ ch, 1597334677);
  // }
  // h1 =
  //   Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
  //   Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  // h2 =
  //   Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
  //   Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  // return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
