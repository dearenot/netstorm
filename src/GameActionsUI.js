import { useCallback } from "react";
import ACTION_TYPE from "./actionsTypes";
import { SKIP_TURN } from "./App";

function GameActionsUI({ onButtonClick }) {
  const items = [ACTION_TYPE.CANCEL_BUILDING, SKIP_TURN];

  const handleClick = useCallback(
    (event) => {
      const type = event.target.getAttribute("data-value");

      onButtonClick(type);
    },
    [onButtonClick]
  );

  return items.map((item) => (
    <button key={item} data-value={item} onClick={handleClick}>
      {item}
    </button>
  ));
}

export default GameActionsUI;
