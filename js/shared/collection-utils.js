export function sumBy(items, iteratee) {
  return items.reduce((sum, item, index) => sum + iteratee(item, index), 0);
}

export function createLookup(items, key = "id") {
  return Object.fromEntries(items.map((item) => [item[key], item]));
}
