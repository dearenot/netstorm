import { ActionPrototype } from "./actionsPrototypes";

export const sunCannonShoot = () => {
  return {};
};

export const SunCannonShoot = ActionPrototype({
  type: "SUN_CANNON_SHOOT",
  priority: 200,
  execute: sunCannonShoot,
});
