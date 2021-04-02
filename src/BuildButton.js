import { useCallback, useMemo } from "react";
import "./styles.css";

const BuildButton = ({
  type,
  cost,
  cooldown,
  onClick,
  buildingPrototype,
  player
}) => {
  let innerClassName = `build${type.toLowerCase()}Button`;

  const isDisabled = useMemo(() => {
    if (buildingPrototype) {
      return player.resources <= buildingPrototype.cost;
    }

    if (type === "CANCEL_BUILDING") {
      if (!player.currentBuilding) {
        return true;
      }
    }

    return false;
  }, [player, buildingPrototype, type]);

  const handleClick = useCallback(() => {
    onClick({ type, buildingPrototype });
  }, [onClick, type, buildingPrototype]);

  return (
    <button
      disabled={isDisabled}
      className="buildPanelButton"
      onClick={handleClick}
      data-value={type}
    >
      <div className={innerClassName}>{type.toLowerCase()}</div>
    </button>
  );
};

export default BuildButton;
