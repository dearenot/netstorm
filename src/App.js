import { useCallback, useEffect, useMemo, useReducer } from "react";
import "./styles.css";
import Cell from "./Cell";
import reducer, { initialGameState } from "./reducer";
import ACTION_TYPE from "./actionsTypes";
import { isNil } from "lodash";
import BuildingUI from "./BuildingUI";
import GameActionsUI from "./GameActionsUI";
import { UNIT_TYPE } from "./UNIT_TYPE";
import { getList } from "./utils";

export const SKIP_TURN = "SKIP_TURN";

const newDispatch = (dispatch, state) => {
  return (action) => {
    if (action.type === ACTION_TYPE.EXEC_ACTION) {
      return action.execAction.execute(state, action.execAction, dispatch);
    } else {
      // return new Promise((resolve) => {
      dispatch(action);
      //   resolve();
      // });
    }
  };
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialGameState);

  const patchedDispatch = useMemo(() => newDispatch(dispatch, state), [
    dispatch,
    state,
  ]);

  window.state = state;

  const {
    field,
    players: { human, bot },
    game: { currentTurn, turnNumber, actionsToExecute, turnIsResolving },
    allUnits: unitsById,
  } = state;

  const { currentBuilding, buildings, buildingPrototype } = human;

  const resFromUnits = useMemo(
    () =>
      getList(unitsById).filter(
        (unit) => unit.type === UNIT_TYPE.MINERAL_RESOURCE
      ),
    [unitsById]
  );

  const availableCells =
    buildingPrototype?.getAvailableCells(state, "human", currentBuilding) || [];

  useEffect(() => {
    patchedDispatch({ type: ACTION_TYPE.INIT_FIRST_LEVEL });
  }, []);

  const handleCellClick = useCallback(
    (event) => {
      const { indexX, indexY, buildingPrototype } = event;

      if (isNil(currentBuilding)) return;

      let act = {
        type: ACTION_TYPE.CREATE_BUILDING,
        buildingType: currentBuilding,
        buildingPrototype,
        posX: indexX,
        posY: indexY,
        playerId: "human",
      };

      patchedDispatch({
        type: ACTION_TYPE.ADD_PLAYER_TURN,
        playerId: "human",
        act,
      });
    },
    [currentBuilding, patchedDispatch]
  );

  // make bot turn
  useEffect(() => {
    if (!isNil(currentTurn)) {
      const humanMadeTurn = currentTurn.some((act) => act.playerId === "human");
      const botMadeTurn = currentTurn.some((act) => act.playerId === "bot");

      if (humanMadeTurn && !botMadeTurn) {
        // make ai turn
        let act = {
          type: ACTION_TYPE.SKIP_TURN,
          playerId: "bot",
        };

        patchedDispatch({
          type: ACTION_TYPE.ADD_PLAYER_TURN,
          playerId: "bot",
          act,
        });
      }
    }
  }, [currentTurn]);

  //resolve turn
  useEffect(() => {
    if (!isNil(currentTurn)) {
      const humanMadeTurn = currentTurn.some((act) => act.playerId === "human");
      const botMadeTurn = currentTurn.some((act) => act.playerId === "bot");

      if (humanMadeTurn && botMadeTurn) {
        patchedDispatch({ type: ACTION_TYPE.RESOLVE_TURN });
      }
    }
  }, [currentTurn]);

  //exec acts
  useEffect(() => {
    async function asyncActs() {
      if (actionsToExecute.length && actionsToExecute.IS_EXECUTING) {
        actionsToExecute.IS_EXECUTING = false;
        patchedDispatch({ type: ACTION_TYPE.START_TURN_RESOLVE });

        const acts = [];

        actionsToExecute.forEach((element) => {
          acts.push(element);
        });

        for (const act of acts) {
          await patchedDispatch({
            type: ACTION_TYPE.EXEC_ACTION,
            execAction: act,
          });
        }

        console.log("END TURN RESOLVE");
        patchedDispatch({ type: ACTION_TYPE.END_TURN_RESOLVE });
      }
    }

    asyncActs();
  }, [actionsToExecute, patchedDispatch]);

  const handleBuildButtonClick = useCallback(
    (event) => {
      const { type, buildingPrototype } = event;

      patchedDispatch({
        type: ACTION_TYPE.SET_CURRENT_BUILDING,
        playerId: "human",
        building: type,
        buildingPrototype,
      });
    },
    [patchedDispatch]
  );

  const handleUIActionClick = useCallback(
    (type) => {
      switch (type) {
        case ACTION_TYPE.SKIP_TURN: {
          const playerAction = {
            type: ACTION_TYPE.SKIP_TURN,
            playerId: "human",
          };

          patchedDispatch({
            type: ACTION_TYPE.ADD_PLAYER_TURN,
            playerId: "human",
            act: playerAction,
          });

          break;
        }
        case ACTION_TYPE.CANCEL_BUILDING: {
          patchedDispatch({
            type: ACTION_TYPE.CANCEL_BUILDING,
            playerId: "human",
          });
          break;
        }
        default:
          return null;
      }
    },
    [patchedDispatch]
  );

  //TODO move ui buttons from building buttons

  return (
    <div className="appWrapper">
      <div className="fieldWrapper">
        {field.length &&
          state.field.map((fieldColumn, indexY) => {
            return fieldColumn.map((field, indexX) => {
              const coord = `${indexX}_${indexY}`;

              return (
                <Cell
                  currentBuilding={currentBuilding}
                  className="fieldCell"
                  value={field}
                  key={coord}
                  indexX={indexX}
                  indexY={indexY}
                  onClick={handleCellClick}
                  humanBuildings={buildings}
                  resources={resFromUnits}
                  unitsById={unitsById}
                  id={`${indexY}_${indexX}`}
                  availableCells={availableCells}
                />
              );
            });
          })}
      </div>

      <div className="rightBar">
        <div className="uiBar">
          <div className="uiColumn">
            human
            <div>{human.resources} </div>
            <div>{human.currentBuilding} </div>
          </div>
          <div className="uiColumn">
            bot
            <div>{bot.resources} </div>
          </div>
        </div>

        <div>turn number {turnNumber}</div>
        <BuildingUI
          human={human}
          onBuildButtonClick={handleBuildButtonClick}
          turnIsResolving={turnIsResolving}
        />
        <GameActionsUI
          onButtonClick={handleUIActionClick}
          turnIsResolving={turnIsResolving}
        />
      </div>
    </div>
  );
};

export default App;
