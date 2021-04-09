import ACTION_TYPE from "../actionsTypes";
import { ActionPrototype } from "./actionsPrototypes";

const MainBaseGenerateResourceExecute = (state, action, dispatch) => {
  return new Promise((resolve) => {
    const { team } = action.instanceParams;

    setTimeout(() => {
      dispatch({
        type: ACTION_TYPE.ADD_RESOURCE_TEAM,
        payload: { team, value: 1 },
      });

      resolve();
    }, 1000);
  });
};

export const MainBaseGenerateResourcePrototype = ActionPrototype({
  type: "MAIN_BASE_GENERATE_RESOURCE",
  priority: 10000,
  execute: MainBaseGenerateResourceExecute,
  resourceAmountToGenerate: 1,
});
