import { useCallback, useMemo } from "react";
import styles from "./styles.css";

const Cell = ({
  className,
  onClick,
  indexX,
  indexY,
  value,
  unitsById,
  id,
  availableCells
}) => {
  let unit = "";
  const renderClassname = unitsById[value]?.gamePrototype.gameRender;

  unit = `${unitsById[value]?.team} ${renderClassname}`;

  const isEnabled = useMemo(() => {
    return availableCells.includes(id);
  }, [availableCells, id]);

  const handleClick = useCallback(() => {
    onClick({ indexX, indexY });
  }, [indexX, indexY, onClick]);

  const remainingHp = Math.min(
    (unitsById[value]?.currentHitpoints /
      unitsById[value]?.gamePrototype.hitpoints) *
      100,
    100
  );

  // TODO move separate unit render
  return (
    <button disabled={!isEnabled} onClick={handleClick} className={className}>
      <div className={unit} />
      {renderClassname && (
        <div id="hp_bar_container" className="hpBarContainer">
          <div
            id="hpBarFill"
            className="hpBarFill"
            style={{ width: `${remainingHp}%` }}
          />
        </div>
      )}
    </button>
  );
};

export default Cell;
