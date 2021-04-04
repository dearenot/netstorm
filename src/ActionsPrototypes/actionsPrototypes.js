import { get, noop, filter, sortBy, first, set, omit, pickBy } from "lodash";
import Victor from "victor";
import { UNIT_TYPE } from "../UNIT_TYPE";
import { getList } from "../utils";

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

export const sunCannonShoot = () => {
  return {};
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

export const SunCannonShoot = ActionPrototype({
  type: "SUN_CANNON_SHOOT",
  priority: 200,
  execute: sunCannonShoot,
});
