import { createFirstLevel } from "./units";
import { cloneDeep, sortBy, filter, first, without, remove } from "lodash";
import { createField } from "./utils";
import ACTION_TYPE from "./actionsTypes";
import { uuidv4 } from "./utils";

export const initialGameState = {
  field: [],
  players: {
    human: {
      resources: 0,
      buildings: []
    },
    bot: {
      resources: 0,
      buildings: []
    }
  },
  game: {
    turnNumber: 0,
    turns: [],
    currentTurn: [],
    actionsToExecute: []
  },
  allUnits: {
    byId: {},
    list: []
  }
};

const reducer = (state = initialGameState, action) => {
  switch (action.type) {
    case ACTION_TYPE.INIT_FIELD: {
      return {
        ...initialGameState,
        field: createField(8, 8, 0, createFirstLevel())
      };
    }
    case ACTION_TYPE.INIT_FIRST_LEVEL: {
      return createFirstLevel();
    }
    case ACTION_TYPE.SKIP_TURN: {
      return state;
    }
    case ACTION_TYPE.ADD_PLAYER_TURN: {
      const { act } = action;

      const newState = cloneDeep(state);

      newState.game.currentTurn.push(act);

      return newState;
    }

    case ACTION_TYPE.RESOLVE_TURN: {
      const { currentTurn } = state.game;

      const newState = cloneDeep(state);

      // BELOW WE CREATE NEWLY SELECTED BUILDINGS

      currentTurn.forEach((act) => {
        if (act.type === ACTION_TYPE.SKIP_TURN) return null;

        // check if they are on the same cell

        switch (act.type) {
          case ACTION_TYPE.CREATE_BUILDING: {
            const { posX, posY } = act;
            const { buildingPrototype } = state.players.human;

            const constr = buildingPrototype.gameConstructor;

            const newBuilding = constr({ team: "human", posX, posY });
            newState.field[posY][posX] = newBuilding.id;
            newState.players.human.buildings.push(newBuilding);

            newState.allUnits.byId[newBuilding.id] = newBuilding;
            newState.allUnits.list.push(newBuilding);

            break;
          }
          case ACTION_TYPE.SKIP_TURN: {
            break;
          }
          default:
            return null;
        }
      });

      // BELOW ACTIONS OF EXISTING UNITS

      // console.log(newState.allUnits.list);

      const gameActions = [];

      newState.allUnits.list.forEach((unit) => {
        if (unit.gamePrototype.actions.length) {
          // console.log(unit.gamePrototype.actions);

          unit.gamePrototype.actions.forEach((unitAction) => {
            const actInstance = {
              ...unitAction,
              instanceParams: {
                id: uuidv4(),
                unitInstanceId: unit.id,
                team: unit.team,
                turn: state.game.turnNumber
              }
            };

            gameActions.push(actInstance);
          });
        }
      });

      // BELOW WE ADD RESOURCES
      // TODO MOVE TO ALL ACTIONS AND ADD PRIORITY

      gameActions.sort((action_1, action_2) =>
        action_1.priority > action_2.priority ? 1 : -1
      );

      newState.game.actionsToExecute = [...gameActions];

      newState.game.actionsToExecute.IS_EXECUTING = true;

      // newState.players.human.buildings.forEach((building) => {
      //   const isBuildingProducesResource =
      //     building.type === UNIT_TYPE.MAIN_BASE;

      //   if (isBuildingProducesResource) {
      //     newState.players.human.resources += 1;
      //   }

      //   const isGatherer = building.type === UNIT_TYPE.GATHERER;

      //   const { resources } = state;

      //   // all this logic should be in 'Gather' ability of gatherer
      //   if (isGatherer && resources.length) {
      //     const distsToResources = resources.map((resource) => {
      //       var vec1 = new Victor(building.posX, building.posY);
      //       var vect2 = new Victor(resource.posX, resource.posY);

      //       const distanceToBuilding = vect2.distance(vec1);
      //       return { distanceToBuilding, resource };
      //     });

      //     const rem = filter(
      //       sortBy(distsToResources, (obj) => obj.distance),
      //       (obj) => obj.distanceToBuilding <= 1.9
      //     );

      //     const resToGather = first(rem);

      //     if (resToGather) {
      //       let resource = resToGather.resource;
      //       if (resource.currentHitpoints > 0) {
      //         resource.currentHitpoints -= 1;
      //         newState.players.human.resources += 1;
      //       } else {
      //         // kil resource
      //         const newResArray = without(
      //           resources,
      //           (res) => res.id === resource.id
      //         );
      //         newState.resources = newResArray;
      //         newState.field[resource.posY][resource.posX] = 0;
      //       }
      //     }
      //   }
      // });

      newState.game.turnNumber += 1;
      newState.game.currentTurn = [];
      newState.players.human.currentBuilding = null;
      newState.players.human.buildingPrototype = null;

      return newState;
    }

    case ACTION_TYPE.SET_CURRENT_BUILDING: {
      const { playerId, building, buildingPrototype } = action;

      const newState = cloneDeep(state);

      newState.players[playerId].currentBuilding = building;
      newState.players[playerId].buildingPrototype = buildingPrototype;

      return newState;
    }
    case ACTION_TYPE.CANCEL_BUILDING: {
      const { playerId } = action;

      const newState = cloneDeep(state);

      newState.players[playerId].currentBuilding = null;
      newState.players[playerId].buildingPrototype = null;

      return newState;
    }
    case ACTION_TYPE.MOCK_AI_TURN: {
      const newState = cloneDeep(state);

      return newState;
    }
    case ACTION_TYPE.EXEC_ACTION: {
      const {
        execAction,
        execAction: { instanceParams }
      } = action;

      const newState = cloneDeep(state);

      const nextState = execAction.execute(newState, instanceParams);

      newState.game.actionsToExecute = remove(
        newState.game.actionsToExecute,
        (act) => act.id === instanceParams.id
      );
      newState.game.actionsToExecute.IS_EXECUTING = false;

      return { ...state, ...newState, ...nextState };
    }

    default:
      return state;
  }
};

export default reducer;
