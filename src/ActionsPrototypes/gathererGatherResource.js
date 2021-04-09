import { get, filter, sortBy, first, set, pickBy } from "lodash";
import Victor from "victor";
import ACTION_TYPE from "../actionsTypes";
import { UNIT_TYPE } from "../UNIT_TYPE";
import { getList } from "../utils";
import { ActionPrototype } from "./actionsPrototypes";

const RANGE_1 = 1.9;

const gathererGatherResource = (state, action, dispatch) => {
  return new Promise((resolve) => {
    const { allUnits } = state;
    const { unitInstanceId } = action.instanceParams;

    const building = allUnits[unitInstanceId];

    const resources = getList(allUnits).filter(
      (unit) => unit.type === UNIT_TYPE.MINERAL_RESOURCE
    );

    if (resources.length) {
      const distsToResources = resources.map((resource) => {
        var vec1 = new Victor(building.posX, building.posY);
        var vect2 = new Victor(resource.posX, resource.posY);

        const distanceToBuilding = vect2.distance(vec1);
        return { distanceToBuilding, resource };
      });

      const resourcesWithinRange = filter(
        sortBy(distsToResources, (obj) => obj.distance),
        (obj) => obj.distanceToBuilding <= RANGE_1
      );

      const resourceToGather = first(resourcesWithinRange);

      if (resourceToGather) {
        let resource = resourceToGather.resource;

        if (resource.currentHitpoints > 0) {
          setTimeout(() => {
            dispatch({
              type: ACTION_TYPE.DEAL_DAMAGE,
              payload: { unitId: resource.id, damage: 1 },
            });
          }, 50);

          setTimeout(() => {
            dispatch({
              type: ACTION_TYPE.ADD_RESOURCE_TEAM,
              payload: { team: building.team, value: 1 },
            });
            resolve();
          }, 100);

          const pathHps = `allUnits[${resource.id}].currentHitpoints`;
          const curHpAfter = get(state, pathHps, 0);

          if (curHpAfter - 1 <= 0) {
            setTimeout(() => {
              dispatch({
                type: ACTION_TYPE.KILL_UNIT,
                payload: { unitId: resource.id },
              });

              resolve();
            }, 50);
          }
        }
      } else {
        // no res to gather
        resolve();
      }
    } else {
      resolve();
    }
  });
};

export const GathererGatherResource = ActionPrototype({
  type: "GATHERER_GATHER_RESOURCE",
  priority: 999999,
  execute: gathererGatherResource,
  resourceAmountToGenerate: 1,
});
