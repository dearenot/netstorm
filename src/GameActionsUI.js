import { useCallback, useContext } from "react";
import ACTION_TYPE from "./actionsTypes";
import { AppContext, SKIP_TURN } from "./App";

function GameActionsUI({ onButtonClick, turnIsResolving = false }) {
  const items = [ACTION_TYPE.CANCEL_BUILDING, SKIP_TURN];
  const { state } = useContext(AppContext);

  const handleClick = useCallback(
    (event) => {
      const type = event.target.getAttribute("data-value");

      onButtonClick(type);
    },
    [onButtonClick]
  );

  const hasCurrentBuilding = !!state.players.human.currentBuilding

  return items.map((item) => (
    <button
      key={item}
      data-value={item}
      onClick={handleClick}
      disabled={turnIsResolving || (item === ACTION_TYPE.CANCEL_BUILDING && !hasCurrentBuilding)}
    >
      {item}
    </button>
  ));
}

export default GameActionsUI;
