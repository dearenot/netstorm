import { useCallback, useMemo } from "react";
import "./styles.css";

const BuildButton = ({
  type,
  cost,
  cooldown,
  onClick,
  buildingPrototype,
  player,
  turnIsResolving,
}) => {
  let innerClassName = `build${type.toLowerCase()}Button`;

  const isDisabled = useMemo(() => {
    if (buildingPrototype) {
      return player.resources <= buildingPrototype.cost || turnIsResolving;
    }

    if (type === "CANCEL_BUILDING") {
      if (!player.currentBuilding) {
        return turnIsResolving;
      }
    }

    return false;
  }, [player, buildingPrototype, type, turnIsResolving]);

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
