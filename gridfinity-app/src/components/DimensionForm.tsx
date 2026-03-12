import { useState } from "react";
import type { ObjectDimensions } from "../gridfinity";

interface Props {
  onSubmit: (dims: ObjectDimensions) => void;
}

export default function DimensionForm({ onSubmit }: Props) {
  const [x, setX] = useState(30);
  const [y, setY] = useState(30);
  const [z, setZ] = useState(20);
  const [cornerRadius, setCornerRadius] = useState(0);

  const maxRadius = Math.min(x, y, z) / 2;

  return (
    <div className="dimension-form">
      <h2>Object Dimensions</h2>

      <div className="input-group">
        <label>
          Width (X)
          <div className="input-row">
            <input
              type="number"
              min={1}
              max={500}
              step={0.1}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
            />
            <span className="unit">mm</span>
          </div>
        </label>
      </div>

      <div className="input-group">
        <label>
          Depth (Y)
          <div className="input-row">
            <input
              type="number"
              min={1}
              max={500}
              step={0.1}
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
            />
            <span className="unit">mm</span>
          </div>
        </label>
      </div>

      <div className="input-group">
        <label>
          Height (Z)
          <div className="input-row">
            <input
              type="number"
              min={1}
              max={500}
              step={0.1}
              value={z}
              onChange={(e) => setZ(Number(e.target.value))}
            />
            <span className="unit">mm</span>
          </div>
        </label>
      </div>

      <div className="input-group">
        <label>
          Corner Radius
          <div className="input-row">
            <input
              type="range"
              min={0}
              max={maxRadius}
              step={0.5}
              value={Math.min(cornerRadius, maxRadius)}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={maxRadius}
              step={0.5}
              value={cornerRadius}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
              className="radius-number"
            />
            <span className="unit">mm</span>
          </div>
        </label>
      </div>

      <button
        className="generate-btn"
        onClick={() =>
          onSubmit({
            x: Math.max(1, x),
            y: Math.max(1, y),
            z: Math.max(1, z),
            cornerRadius: Math.max(0, Math.min(cornerRadius, maxRadius)),
          })
        }
      >
        Generate Gridfinity Bin
      </button>
    </div>
  );
}
