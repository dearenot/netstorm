import { noop } from "lodash";

export const ActionPrototype = ({
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
