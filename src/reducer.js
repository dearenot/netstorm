import { createFirstLevel } from "./units";
import { cloneDeep, remove } from "lodash";
import { createField, getList } from "./utils";
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
    turnIsResolving: false,
  },
  allUnits: {},
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

            newState.allUnits[newBuilding.id] = newBuilding;

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

      const gameActions = [];

      // console.log(newState.allUnits, getList(newState.allUnits));

      getList(newState.allUnits).forEach((unit) => {
        // console.log(unit);

        if (unit.gamePrototype.actions.length) {
          unit.gamePrototype.actions.forEach((unitAction) => {
            const actInstance = {
              ...unitAction,
              instanceParams: {
                id: uuidv4(),
                unitInstanceId: unit.id,
                team: unit.team,
                turn: state.game.turnNumber,
                delay: 100,
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

    case ACTION_TYPE.ADD_RESOURCE_TEAM: {
      const { value, team } = action.payload;

      const curValue = state.players[team].resources;

      return {
        ...state,
        players: {
          ...state.players,
          [team]: { ...state.players[team], resources: curValue + value },
        },
      };
    }

    case ACTION_TYPE.START_TURN_RESOLVE: {
      return { ...state, game: { ...state.game, turnIsResolving: true } };
    }

    case ACTION_TYPE.END_TURN_RESOLVE: {
      return { ...state, game: { ...state.game, turnIsResolving: false } };
    }

    default:
      return state;
  }
};

export default reducer;
