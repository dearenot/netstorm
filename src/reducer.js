import { createFirstLevel } from "./units";
import { cloneDeep, merge, remove } from "lodash";
import { createField } from "./utils";
import ACTION_TYPE from "./actionsTypes";
import { uuidv4 } from "./utils";
import { mergeDeepRight } from "ramda";

export const initialGameState = {
  field: [],
  players: {
    human: {
      resources: 0,
      buildings: [],
    },
    bot: {
      resources: 0,
      buildings: [],
    },
  },
  game: {
    turnNumber: 0,
    turns: [],
    currentTurn: [],
    actionsToExecute: [],
  },
  allUnits: {
    byId: {},
    list: [],
  },
};

const reducer = (state = initialGameState, action) => {
  switch (action.type) {
    case ACTION_TYPE.INIT_FIELD: {
      return {
        ...initialGameState,
        field: createField(8, 8, 0, createFirstLevel()),
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
                turn: state.game.turnNumber,
                delay: 500,
              },
            };

            gameActions.push(actInstance);
          });
        }
      });

      gameActions.sort((action_1, action_2) =>
        action_1.priority > action_2.priority ? 1 : -1
      );

      newState.game.actionsToExecute = [...gameActions];

      newState.game.actionsToExecute.IS_EXECUTING = true;

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
        execAction: { instanceParams },
      } = action;

      const newState = cloneDeep(state);

      const nextState = execAction.execute(newState, instanceParams);

      newState.game.actionsToExecute = remove(
        newState.game.actionsToExecute,
        (act) => act.id === instanceParams.id
      );
      newState.game.actionsToExecute.IS_EXECUTING = false;

      return mergeDeepRight(state, { ...newState, ...nextState });
    }

    default:
      return state;
  }
};

export default reducer;
