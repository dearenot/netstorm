import { get, filter, sortBy, first, set, pickBy } from "lodash";
import Victor from "victor";
import { UNIT_TYPE } from "../UNIT_TYPE";
import { getList } from "../utils";
import { ActionPrototype } from "./actionsPrototypes";

const RANGE_1 = 1.9;

const gathererGatherResource = (state, options) => {
  const { allUnits } = state;
  const { unitInstanceId } = options;

  const building = allUnits[unitInstanceId];

  const resources = getList(allUnits).filter(
    (unit) => unit.type === UNIT_TYPE.MINERAL_RESOURCE
  );

  const newState = {};

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
        const pathHps = `allUnits[${resource.id}].currentHitpoints`;
        const curHp = get(state, pathHps, 0);

        set(newState, pathHps, curHp - 1);

        const path = `players[${building.team}].resources`;
        const cur = get(state, path, 0);

        set(newState, path, cur + 1);

        const curHpAfter = get(newState, pathHps, 0);

        if (curHpAfter <= 0) {
          newState.allUnits = pickBy(
            state.allUnits,
            (unit) => unit.id !== resource.id
          );

          newState.field = [...state.field];
          newState.field[resource.posY][resource.posX] = 0;
        }
      }
    }
  }

  return newState;
};

export const GathererGatherResource = ActionPrototype({
  type: "GATHERER_GATHER_RESOURCE",
  priority: 999999,
  execute: gathererGatherResource,
  resourceAmountToGenerate: 1,
});
