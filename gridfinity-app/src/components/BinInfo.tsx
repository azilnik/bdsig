import type { GridfinityBin } from "../gridfinity";
import { GRID_UNIT, UNIT_HEIGHT } from "../gridfinity";

interface Props {
  bin: GridfinityBin;
}

export default function BinInfo({ bin }: Props) {
  return (
    <div className="bin-info">
      <h2>Gridfinity Bin Specs</h2>

      <div className="spec-grid">
        <div className="spec-section">
          <h3>Grid Size</h3>
          <div className="spec-row">
            <span className="spec-label">Grid Units</span>
            <span className="spec-value">
              {bin.gridX} x {bin.gridY} x {bin.gridZ}
            </span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Grid Unit Size</span>
            <span className="spec-value">{GRID_UNIT}mm x {GRID_UNIT}mm</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Height Unit</span>
            <span className="spec-value">{UNIT_HEIGHT}mm</span>
          </div>
        </div>

        <div className="spec-section">
          <h3>Outer Dimensions</h3>
          <div className="spec-row">
            <span className="spec-label">Width</span>
            <span className="spec-value">{bin.outerX.toFixed(1)} mm</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Depth</span>
            <span className="spec-value">{bin.outerY.toFixed(1)} mm</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Height</span>
            <span className="spec-value">{bin.outerZ.toFixed(1)} mm</span>
          </div>
        </div>

        <div className="spec-section">
          <h3>Inner Cavity</h3>
          <div className="spec-row">
            <span className="spec-label">Width</span>
            <span className="spec-value">{bin.innerX.toFixed(1)} mm</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Depth</span>
            <span className="spec-value">{bin.innerY.toFixed(1)} mm</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Height</span>
            <span className="spec-value">{bin.innerZ.toFixed(1)} mm</span>
          </div>
        </div>

        <div className="spec-section">
          <h3>Object</h3>
          <div className="spec-row">
            <span className="spec-label">Size</span>
            <span className="spec-value">
              {bin.object.x} x {bin.object.y} x {bin.object.z} mm
            </span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Corner Radius</span>
            <span className="spec-value">{bin.object.cornerRadius} mm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
