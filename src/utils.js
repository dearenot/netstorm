export function createField(
  width = 8,
  heigth = 8,
  defaultValue = 0,
  initialField = null
) {
  if (initialField !== null && initialField !== undefined) {
    return initialField;
  }

  const res = [];

  for (let i = 0; i < heigth; i++) {
    res[i] = [];
    for (let j = 0; j < width; j++) {
      res[i].push(defaultValue);
    }
  }
  return res;
}

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getList(obj) {
  return Object.values(obj);
}

export function areOnSameLine(unit1, unit2) {
  return unit1.posX === unit2.posX || unit1.posY === unit2.posY;
}

export const RANGE_1 = 1.9;
export const RANGE_4 = 4.9;
