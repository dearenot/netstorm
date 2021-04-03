import {
  GathererGatherResource,
  MainBaseGenerateResourcePrototype,
} from "../ActionsPrototypes/actionsPrototypes";
import {
  ExtenderInstance,
  GathererInstance,
  MainBaseInstance,
  MineralResourceInstance,
  DiscThrowerInstance,
} from "../units";
import { UNIT_TYPE } from "../UNIT_TYPE";
import getAvailableCellsDefault from "./getAvailableCellsDefault";

const BuildingPrototype = ({
  type,
  cost = 0,
  cooldown = 0,
  hitpoints = 1,
  gameConstructor = undefined,
  gameRender = undefined,
  getAvailableCells = undefined,
  actions = [],
}) => {
  return {
    type,
    cost,
    cooldown,
    hitpoints,
    gameConstructor,
    gameRender,
    getAvailableCells,
    actions,
  };
};

export const MainBasePrototype = BuildingPrototype({
  type: UNIT_TYPE.MAIN_BASE,
  cost: 1,
  cooldown: 0,
  hitpoints: 20,
  buildingTime: 0,
  gameConstructor: MainBaseInstance,
  gameRender: "main",
  getAvailableCells: getAvailableCellsDefault,
  actions: [MainBaseGenerateResourcePrototype],
});

export const ExtenderPrototype = BuildingPrototype({
  type: UNIT_TYPE.EXTENDER,
  cost: 1,
  cooldown: 0,
  hitpoints: 5,
  buildingTime: 0,
  gameConstructor: ExtenderInstance,
  gameRender: "extender",
  getAvailableCells: getAvailableCellsDefault,
  actions: [],
});

export const MineralResourcePrototype = BuildingPrototype({
  type: UNIT_TYPE.MINERAL_RESOURCE,
  cost: 0,
  cooldown: 0,
  hitpoints: 1,
  buildingTime: 0,
  gameConstructor: MineralResourceInstance,
  gameRender: "resource",
  actions: [],
});

export const GathererPrototype = BuildingPrototype({
  type: UNIT_TYPE.GATHERER,
  cost: 1,
  cooldown: 2,
  hitpoints: 6,
  buildingTime: 0,
  gameConstructor: GathererInstance,
  gameRender: "gatherer",
  getAvailableCells: getAvailableCellsDefault,
  actions: [GathererGatherResource],
});

export const DiscThrowerPrototype = BuildingPrototype({
  type: UNIT_TYPE.DISC_THROWER,
  cost: 1,
  cooldown: 2,
  hitpoints: 6,
  buildingTime: 0,
  gameConstructor: DiscThrowerInstance,
  gameRender: "thrower",
  getAvailableCells: getAvailableCellsDefault,
  actions: [],
});

export const BuildingPrototypes = {
  // [UNIT_TYPE.MAIN_BASE]: MainBasePrototype,
  [UNIT_TYPE.EXTENDER]: ExtenderPrototype,
  [UNIT_TYPE.GATHERER]: GathererPrototype,
  [UNIT_TYPE.DISC_THROWER]: DiscThrowerPrototype,
};
