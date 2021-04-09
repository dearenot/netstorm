import { get, filter, sortBy, first, set, omit } from "lodash";
import Victor from "victor";
import ACTION_TYPE from "../actionsTypes";

import { getList } from "../utils";
import { ActionPrototype } from "./actionsPrototypes";

const RANGE_1 = 1.9;

const discThrowerThrow = (state, action, dispatch) => {
  return new Promise((resolve) => {
    const { allUnits } = state;
    const { unitInstanceId } = action.instanceParams;

    const building = allUnits[unitInstanceId];

    const hasEnemies = getList(allUnits)
      .filter((unit) => unit.team !== "neutral")
      .some((unit) => unit.team !== building.team);

    if (hasEnemies) {
      const distsToEnemies = getList(allUnits)
        .filter(
          (unit) => unit.team !== building.team && unit.team !== "neutral"
        )
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

          setTimeout(() => {
            dispatch({
              type: ACTION_TYPE.DEAL_DAMAGE,
              payload: { unitId: enemy.id, damage: 1 },
            });
            resolve();
          }, 25);

          const curHpAfter = get(state, path, 0);

          if (curHpAfter - 1 <= 0) {
            setTimeout(() => {
              dispatch({
                type: ACTION_TYPE.KILL_UNIT,
                payload: { unitId: enemy.id },
              });

              resolve();
            }, 50);
          }
        }
      } else {
        // no near enemies
        resolve();
      }
    } else {
      // no enemies
      resolve();
    }
  });
};

export const DiscThrowerThrow = ActionPrototype({
  type: "DISC_THROWER_THROW",
  priority: 100,
  execute: discThrowerThrow,
});
