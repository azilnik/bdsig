// Gridfinity standard dimensions (mm)
export const GRID_UNIT = 42; // mm per grid unit
export const BASE_HEIGHT = 5; // mm base plate height
export const WALL_THICKNESS = 1.2; // mm wall thickness
export const CLEARANCE = 0.5; // mm clearance per side
export const BIN_LIP_HEIGHT = 4.4; // mm stacking lip
export const UNIT_HEIGHT = 7; // mm per height unit

export interface ObjectDimensions {
  x: number; // mm
  y: number; // mm
  z: number; // mm
  cornerRadius: number; // mm
}

export interface GridfinityBin {
  gridX: number; // grid units wide
  gridY: number; // grid units deep
  gridZ: number; // height units tall
  innerX: number; // mm inner cavity width
  innerY: number; // mm inner cavity depth
  innerZ: number; // mm inner cavity height
  outerX: number; // mm total outer width
  outerY: number; // mm total outer depth
  outerZ: number; // mm total outer height
  object: ObjectDimensions;
}

export function calculateBin(obj: ObjectDimensions): GridfinityBin {
  // Inner cavity must fit the object plus clearance
  const requiredX = obj.x + CLEARANCE * 2;
  const requiredY = obj.y + CLEARANCE * 2;
  const requiredZ = obj.z + CLEARANCE;

  // Calculate grid units needed (round up to nearest integer)
  const gridX = Math.max(1, Math.ceil(requiredX / GRID_UNIT));
  const gridY = Math.max(1, Math.ceil(requiredY / GRID_UNIT));

  // Available inner space = grid units * unit size - 2 * wall thickness
  const innerX = gridX * GRID_UNIT - WALL_THICKNESS * 2;
  const innerY = gridY * GRID_UNIT - WALL_THICKNESS * 2;

  // Height: base + object clearance + lip
  const innerZ = requiredZ;
  const totalInternalHeight = BASE_HEIGHT + innerZ + BIN_LIP_HEIGHT;
  const gridZ = Math.max(1, Math.ceil(totalInternalHeight / UNIT_HEIGHT));
  const outerZ = gridZ * UNIT_HEIGHT;

  return {
    gridX,
    gridY,
    gridZ,
    innerX,
    innerY,
    innerZ,
    outerX: gridX * GRID_UNIT,
    outerY: gridY * GRID_UNIT,
    outerZ,
    object: obj,
  };
}
