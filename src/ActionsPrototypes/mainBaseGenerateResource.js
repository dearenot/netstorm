import { ActionPrototype } from "./actionsPrototypes";

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

export const MainBaseGenerateResourcePrototype = ActionPrototype({
  type: "MAIN_BASE_GENERATE_RESOURCE",
  priority: 10000,
  execute: MainBaseGenerateResourceExecute,
  resourceAmountToGenerate: 1,
});
