import { get, noop, filter, without, sortBy, first, set } from "lodash";
import Victor from "victor";

const ActionPrototype = ({
  type = "DEFAULT_ACTION_PROTOTYPE",
  priority = 0,
  execute = noop,
  // params that are affected - distance, damage
}) => {
  return {
    type,
    priority,
    execute,
  };
};

const RANGE_1 = 1.9;

const MainBaseGenerateResourceExecute = (state, options) => {
  const playersState = get(state, "players", {});

  const { team } = options;

  const curValue = state.players[team].resources;

  return {
    players: {
      ...state.players,
      [team]: { ...state.players[team], resources: curValue + 1 },
    },
  };
};

const gathererGatherResource = (state, options) => {
  const {
    resources,
    allUnits: { byId: allUnitsIds },
  } = state;
  const { unitInstanceId } = options;

  const building = allUnitsIds[unitInstanceId];

  console.log(building, options);

  const newState = {};

  // all this logic should be in 'Gather' ability of gatherer
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
        resource.currentHitpoints -= 1;
        // here
        const path = `players[${building.team}].resources`;
        const cur = get(state, path, 0);
        console.log(cur);
        set(newState, path, cur + 1);
      } else {
        // kil resource
        const newResArray = without(resources, (res) => res.id === resource.id);
        newState.resources = newResArray;
        newState.field = [...state.field];
        newState.field[resource.posY][resource.posX] = 0;
      }
    }
  }
  console.log("gath state to return ", newState);
  return newState;
};

export const MainBaseGenerateResourcePrototype = ActionPrototype({
  type: "MAIN_BASE_GENERATE_RESOURCE",
  priority: 10000,
  execute: MainBaseGenerateResourceExecute,
  resourceAmountToGenerate: 1,
});

export const GathererGatherResource = ActionPrototype({
  type: "GATHERER_GATHER_RESOURCE",
  priority: 999999,
  execute: gathererGatherResource,
  resourceAmountToGenerate: 1,
});
