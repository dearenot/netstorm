import { get, filter, sortBy, first, set, omit } from "lodash";
import Victor from "victor";

import { getList } from "../utils";
import { ActionPrototype } from "./actionsPrototypes";

const RANGE_1 = 1.9;

const discThrowerThrow = (state, options) => {
  const { allUnits } = state;
  const { unitInstanceId } = options;

  const newState = {};

  const building = allUnits[unitInstanceId];

  const hasEnemies = getList(allUnits)
    .filter((unit) => unit.team !== "neutral")
    .some((unit) => unit.team !== building.team);

  if (hasEnemies) {
    console.log("has enemies");

    const distsToEnemies = getList(allUnits)
      .filter((unit) => unit.team !== building.team && unit.team !== "neutral")
      .map((unit) => {
        var vec1 = new Victor(building.posX, building.posY);
        var vect2 = new Victor(unit.posX, unit.posY);

        const distanceToBuilding = vect2.distance(vec1);
        return { distanceToBuilding, enemy: unit };
      });

    const enemiesWithinRange = filter(
      sortBy(distsToEnemies, (obj) => obj.distance),
      (obj) => obj.distanceToBuilding <= RANGE_1
    );

    const enemyToAttack = first(enemiesWithinRange);

    if (enemyToAttack) {
      let enemy = enemyToAttack.enemy;
      if (enemy.currentHitpoints > 0) {
        const path = `allUnits[${enemy.id}].currentHitpoints`;
        const cur = get(state, path, 0);

        set(newState, path, cur - 1);

        console.log(cur);

        const curHpAfter = get(newState, path, 0);

        if (curHpAfter <= 0) {
          const newUnitsObj = omit(allUnits, (unit) => unit.id === enemy.id);

          newState.allUnits = newUnitsObj;

          newState.field = [...state.field];
          newState.field[enemy.posY][enemy.posX] = 0;
        }
      }
    }
  }

  return newState;
};

export const DiscThrowerThrow = ActionPrototype({
  type: "DISC_THROWER_THROW",
  priority: 100,
  execute: discThrowerThrow,
});
