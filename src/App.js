import { useCallback, useEffect, useMemo, useReducer } from "react";
import "./styles.css";
import Cell from "./Cell";
import reducer, { initialGameState } from "./reducer";
import ACTION_TYPE from "./actionsTypes";
import { isNil } from "lodash";
import BuildingUI from "./BuildingUI";
import GameActionsUI from "./GameActionsUI";

export const SKIP_TURN = "SKIP_TURN";

const newDispatch = (dispatch) => {
  return (action) => {
    if (action.type === ACTION_TYPE.EXEC_ACTION) {
      return new Promise((resolve) => {
        console.log(action);

        const { delay } = action.execAction.instanceParams;

        // start anim
        dispatch(action);

        // after act delay
        setTimeout(() => {
          console.log("resolve");

          resolve();
        }, delay);
      });
    } else {
      dispatch(action);
    }
  };
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialGameState);

  const patchedDispatch = useMemo(() => newDispatch(dispatch), [dispatch]);

  window.state = state;

  const {
    field,
    players: { human, bot },
    game: { currentTurn, turnNumber, actionsToExecute },
    allUnits: { byId: unitsById },
    resources,
  } = state;

  const { currentBuilding, buildings, buildingPrototype } = human;

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
    [currentBuilding]
  );

  // make bot turn
  useEffect(() => {
    if (!isNil(currentTurn)) {
      const humanMadeTurn = currentTurn.some((act) => act.playerId === "human");
      const botMadeTurn = currentTurn.some((act) => act.playerId === "bot");

      if (humanMadeTurn && !botMadeTurn) {
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

  async function processArray(array) {
    for (const item of array) {
      await patchedDispatch(item);
    }
    console.log("Done!");
  }

  //exec acts
  useEffect(async () => {
    if (actionsToExecute.length && actionsToExecute.IS_EXECUTING) {
      actionsToExecute.IS_EXECUTING = false;

      console.log("act to exec ", actionsToExecute);

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
    }
  }, [actionsToExecute]);

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
                  resources={resources}
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
        <BuildingUI human={human} onBuildButtonClick={handleBuildButtonClick} />
        <GameActionsUI onButtonClick={handleUIActionClick} />
      </div>
    </div>
  );
};

export default App;
