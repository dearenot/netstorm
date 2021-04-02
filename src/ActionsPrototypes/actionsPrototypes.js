import { get, noop, set } from "lodash";

const ActionPrototype = ({
  type = "DEFAULT_ACTION_PROTOTYPE",
  priority = 0,
  execute = noop
  // params that are affected - distance, damage
}) => {
  return {
    type,
    priority,
    execute
  };
};

const MainBaseGenerateResourceExecute = (state, options) => {
  const playersState = get(state, "players", {});

  const { team } = options;

  console.log(team, playersState);
  const curValue = state.players[team].resources;

  console.log(team, playersState);

  return {
    players: {
      ...state.players,
      [team]: { ...state.players[team], resources: curValue + 1 }
    }
  };
};

const gathererGatherResource = (state, options) => {};

export const MainBaseGenerateResourcePrototype = ActionPrototype({
  type: "MAIN_BASE_GENERATE_RESOURCE",
  priority: 10000,
  execute: MainBaseGenerateResourceExecute,
  resourceAmountToGenerate: 1
});

export const GathererGatherResource = ActionPrototype({
  type: "GATHERER_GATHER_RESOURCE",
  priority: 9999,
  execute: gathererGatherResource,
  resourceAmountToGenerate: 1
});
