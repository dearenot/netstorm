import { UNIT_TYPE } from "../UNIT_TYPE";
import { uniq } from "lodash";
import { getList } from "../utils";

var Victor = require("victor");

function getAvailableCellsDefault(state, teamId, building) {
  const { field, allUnits } = state;

  const availableCells = [];

  const extendingBuildings = getList(allUnits).filter(
    (unit) =>
      unit.team === teamId &&
      [UNIT_TYPE.MAIN_BASE, UNIT_TYPE.EXTENDER].includes(unit.type)
  );

  extendingBuildings.forEach((building) => {
    field.forEach((row, indexY) => {
      row.forEach((cell, indexX) => {
        var vec1 = new Victor(building.posX, building.posY);
        var vect2 = new Victor(indexX, indexY);

        const distanceToBuilding = vect2.distance(vec1);

        if (distanceToBuilding <= 2.9 && field[indexY][indexX] === 0) {
          availableCells.push(`${indexY}_${indexX}`);
        }
      });
    });
  });

  return uniq(availableCells);
}

export default getAvailableCellsDefault;
