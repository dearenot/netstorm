import {
  DiscThrowerPrototype,
  GeneratorPrototype,
  GathererPrototype,
  MainBasePrototype,
  MineralResourcePrototype,
  SunCannonPrototype,
} from "./UnitsPrototypes/unitsPrototypes";
import { UNIT_TYPE } from "./UNIT_TYPE";
import { uuidv4 } from "./utils";

export function DiscThrowerInstance({
  team,
  id = `${team}_thrower_${uuidv4()}`,
  posX,
  posY,
}) {
  return {
    type: UNIT_TYPE.DISC_THROWER,
    id,
    team,
    posX,
    posY,
    currentHitpoints: DiscThrowerPrototype.hitpoints,
    gamePrototype: DiscThrowerPrototype,
  };
}

export function MainBaseInstance({
  team,
  id = `${team}_main_${uuidv4()}`,
  posX,
  posY,
}) {
  return {
    type: UNIT_TYPE.MAIN_BASE,
    id,
    team,
    posX,
    posY,
    currentHitpoints: MainBasePrototype.hitpoints,
    gamePrototype: MainBasePrototype,
    actions: MainBasePrototype.actions,
  };
}

export function GeneratorInstance({
  team,
  id = `${team}_generator_${uuidv4()}`,
  posX,
  posY,
}) {
  return {
    type: UNIT_TYPE.GENERATOR,
    id,
    team,
    posX,
    posY,
    currentHitpoints: GeneratorPrototype.hitpoints,
    gamePrototype: GeneratorPrototype,
  };
}

export function MineralResourceInstance({ id = uuidv4(), posX, posY, team }) {
  return {
    type: UNIT_TYPE.MINERAL_RESOURCE,
    id,
    posX,
    posY,
    team,
    currentHitpoints: MineralResourcePrototype.hitpoints,
    gamePrototype: MineralResourcePrototype,
  };
}

export function GathererInstance({
  team,
  id = `${team}_gatherer_${uuidv4()}`,
  posX,
  posY,
}) {
  return {
    type: UNIT_TYPE.GATHERER,
    id,
    posX,
    posY,
    team,
    currentHitpoints: GathererPrototype.hitpoints,
    gamePrototype: GathererPrototype,
  };
}

export function SunCannonInstance({
  team,
  id = `${team}_sun_cannon_${uuidv4()}`,
  posX,
  posY,
}) {
  return {
    type: UNIT_TYPE.SUN_CANNON,
    id,
    posX,
    posY,
    team,
    currentHitpoints: SunCannonPrototype.hitpoints,
    gamePrototype: SunCannonPrototype,
  };
}

//

export const Player = ({ id, team, resources = 0, buildings = [] }) => {
  return {
    id,
    team,
    resources,
    buildings,
  };
};

export function createField(width = 8, heigth = 8) {
  const res = [];

  for (let i = 0; i < heigth; i++) {
    res[i] = [];
    for (let j = 0; j < width; j++) {
      res[i].push(0);
    }
  }

  return res;
}

function addToField(field, unit) {
  field[unit.posY][unit.posX] = unit.id;

  return field;
}

export const createFirstLevel = () => {
  const HumanMain = MainBaseInstance({
    team: "human",
    id: "human_main_1",
    posX: 0,
    posY: 0,
  });
  const BotMain = MainBaseInstance({
    team: "bot",
    id: "bot_main_1",
    posX: 7,
    posY: 7,
  });

  const HumanPlayer = Player({
    id: "human",
    team: 0,
    resources: 1,
    buildings: [HumanMain],
  });
  const BotPlayer = Player({
    id: "bot",
    team: 1,
    resources: 1,
    buildings: [BotMain],
  });

  // console.log(HumanMain, BotMain);

  const resHuman = MineralResourceInstance({
    id: "mineral_resource_hum",
    posX: 2,
    posY: 1,
    team: "neutral",
  });
  const resBot = MineralResourceInstance({
    id: "mineral_resource_bot",
    posX: 5,
    posY: 6,
    team: "neutral",
  });
  const resCentral = MineralResourceInstance({
    id: "mineral_resource_central",
    posX: 3,
    posY: 4,
    team: "neutral",
  });

  const BotDisc1 = DiscThrowerInstance({
    team: "bot",
    id: "bot_main_disc_1",
    posX: 6,
    posY: 6,
  });

  const field30 = createField(8, 8);
  addToField(field30, HumanMain);
  addToField(field30, BotMain);
  addToField(field30, resBot);
  addToField(field30, resCentral);
  addToField(field30, resHuman);
  addToField(field30, BotDisc1);

  return {
    field: field30,
    players: {
      [HumanPlayer.id]: HumanPlayer,
      [BotPlayer.id]: BotPlayer,
    },
    game: {
      turnNumber: 0,
      turns: [],
      currentTurn: [],
      actionsToExecute: [],
      turnIsResolving: false,
    },
    allUnits: {
      [BotMain.id]: BotMain,
      [HumanMain.id]: HumanMain,
      [resHuman.id]: resHuman,
      [resBot.id]: resBot,
      [resCentral.id]: resCentral,
      [BotDisc1.id]: BotDisc1,
    },
  };
};
