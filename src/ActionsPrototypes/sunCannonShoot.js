import { filter, first, get, sortBy } from "lodash";
import Victor from "victor";
import ACTION_TYPE from "../actionsTypes";
import { areOnSameLine, getList, RANGE_4 } from "../utils";
import { ActionPrototype } from "./actionsPrototypes";

export const sunCannonShoot = (state, action, dispatch) => {
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
        (obj) => obj.distanceToBuilding <= RANGE_4
      );

      const enemiesWithinDirection = filter(enemiesWithinRange, (obj) => {
        return areOnSameLine(building, obj.enemy);
      });

      const enemyToAttack = first(enemiesWithinDirection);

      if (enemyToAttack) {
        let enemy = enemyToAttack.enemy;
        if (enemy.currentHitpoints > 0) {
          const path = `allUnits[${enemy.id}].currentHitpoints`;
          const Damage = 1;
          setTimeout(() => {
            dispatch({
              type: ACTION_TYPE.DEAL_DAMAGE,
              payload: { unitId: enemy.id, damage: Damage },
            });
            resolve();
          }, 25);

          const curHpAfter = get(state, path, 0);

          if (curHpAfter - Damage <= 0) {
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
        resolve();
      }
    } else {
      //
      resolve();
    }
  });
};

export const SunCannonShoot = ActionPrototype({
  type: "SUN_CANNON_SHOOT",
  priority: 200,
  execute: sunCannonShoot,
});
