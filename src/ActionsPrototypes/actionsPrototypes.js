import {
  get,
  noop,
  filter,
  without,
  sortBy,
  first,
  set,
  omit,
  pickBy,
} from "lodash";
import Victor from "victor";
import { UNIT_TYPE } from "../UNIT_TYPE";

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
    allUnits: { byId: allUnitsIds, list: allUnitsList },
  } = state;
  const { unitInstanceId } = options;

  const building = allUnitsIds[unitInstanceId];

  const resources = allUnitsList.filter(
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
        const pathHps = `allUnits.byId[${resource.id}].currentHitpoints`;
        const curHp = get(state, pathHps, 0);

        set(newState, pathHps, curHp - 1);

        const path = `players[${building.team}].resources`;
        const cur = get(state, path, 0);

        set(newState, path, cur + 1);

        if (curHp - 1 <= 0) {
          newState.allUnits.byId = pickBy(
            state.allUnits.byId,
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

const discThrowerThrow = (state, options) => {
  const {
    allUnits: { byId: allUnitsIds, list: allUnitsList },
  } = state;
  const { unitInstanceId } = options;

  const newState = {};

  const building = allUnitsIds[unitInstanceId];

  const hasEnemies = allUnitsList
    .filter((unit) => unit.team !== "neutral")
    .some((unit) => unit.team !== building.team);

  if (hasEnemies) {
    console.log("has enemies");

    const distsToEnemies = allUnitsList
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
        const path = `allUnits.byId[${enemy.id}].currentHitpoints`;
        const cur = get(state, path, 0);

        set(newState, path, cur - 1);

        console.log(cur);
      } else {
        // kil enemy
        const newUnitsArr = without(
          allUnitsList,
          (unit) => unit.id === enemy.id
        );
        const newUnitsObj = omit(allUnitsIds, (unit) => unit.id === enemy.id);

        newState.allUnits = {
          byId: { ...allUnitsIds },
          list: [...allUnitsList],
        };

        newState.allUnits.byId = newUnitsObj;
        newState.allUnits.list = newUnitsArr;

        newState.field = [...state.field];
        newState.field[enemy.posY][enemy.posX] = 0;
      }
    }
  }

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

export const DiscThrowerThrow = ActionPrototype({
  type: "DISC_THROWER_THROW",
  priority: 100,
  execute: discThrowerThrow,
});
