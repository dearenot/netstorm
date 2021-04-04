import BuildButton from "./BuildButton";
import { BuildingPrototypes } from "./UnitsPrototypes/unitsPrototypes";

const BuildingUI = ({ human, onBuildButtonClick, turnIsResolving = false }) => {
  const items = Object.keys(BuildingPrototypes);

  return (
    <div className="buildPanel">
      {items.map((building) => {
        return (
          <BuildButton
            buildingPrototype={BuildingPrototypes[building]}
            player={human}
            key={building}
            type={building}
            onClick={onBuildButtonClick}
            turnIsResolving={turnIsResolving}
          />
        );
      })}
    </div>
  );
};

export default BuildingUI;
