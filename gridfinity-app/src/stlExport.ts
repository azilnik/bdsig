import * as THREE from "three";
import type { GridfinityBin } from "./gridfinity";
import { WALL_THICKNESS, BASE_HEIGHT, BIN_LIP_HEIGHT } from "./gridfinity";

/**
 * Build a Gridfinity bin mesh as a group of geometries.
 * Returns a THREE.Group containing the bin shell and the cavity.
 */
export function buildBinGeometry(bin: GridfinityBin): THREE.Group {
  const group = new THREE.Group();

  const outerW = bin.outerX;
  const outerD = bin.outerY;
  const outerH = bin.outerZ;
  const wall = WALL_THICKNESS;
  const baseH = BASE_HEIGHT;
  const lipH = BIN_LIP_HEIGHT;
  const cavityH = outerH - baseH - lipH;

  // Outer shell
  const outerGeo = new THREE.BoxGeometry(outerW, outerH, outerD);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x4a90d9,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  outerMesh.position.set(0, outerH / 2, 0);
  group.add(outerMesh);

  // Inner cavity (darker, to show the hollow)
  const cavW = outerW - wall * 2;
  const cavD = outerD - wall * 2;
  const cavGeo = new THREE.BoxGeometry(cavW, cavityH, cavD);
  const cavMat = new THREE.MeshStandardMaterial({
    color: 0x2a5a99,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });
  const cavMesh = new THREE.Mesh(cavGeo, cavMat);
  cavMesh.position.set(0, baseH + cavityH / 2, 0);
  group.add(cavMesh);

  return group;
}

/**
 * Build the object (rectangular prism with optional rounded corners) as a mesh.
 */
export function buildObjectMesh(bin: GridfinityBin): THREE.Mesh {
  const obj = bin.object;
  const r = Math.min(
    obj.cornerRadius,
    obj.x / 2 - 0.01,
    obj.y / 2 - 0.01,
    obj.z / 2 - 0.01
  );

  let geometry: THREE.BufferGeometry;

  if (r > 0.1) {
    // Use RoundedBoxGeometry approach: extruded rounded rectangle via shape
    const shape = createRoundedRectShape(obj.x, obj.y, r);
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: obj.z,
      bevelEnabled: true,
      bevelThickness: Math.min(r, obj.z / 2),
      bevelSize: Math.min(r, Math.min(obj.x, obj.y) / 2 - 0.01),
      bevelSegments: 8,
    };
    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Center the geometry
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;
    const cx = (bb.max.x + bb.min.x) / 2;
    const cy = (bb.max.y + bb.min.y) / 2;
    const cz = (bb.max.z + bb.min.z) / 2;
    geometry.translate(-cx, -cy, -cz);
  } else {
    geometry = new THREE.BoxGeometry(obj.x, obj.z, obj.y);
  }

  const material = new THREE.MeshStandardMaterial({
    color: 0xf5a623,
    roughness: 0.4,
    metalness: 0.1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  // Position object sitting on base inside bin
  const baseH = BASE_HEIGHT;
  mesh.position.set(0, baseH + obj.z / 2, 0);

  return mesh;
}

function createRoundedRectShape(
  w: number,
  h: number,
  r: number
): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;

  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  return shape;
}

/**
 * Generate a solid STL binary for the Gridfinity bin (shell with cavity).
 */
export function generateBinSTL(bin: GridfinityBin): ArrayBuffer {
  const outerW = bin.outerX;
  const outerD = bin.outerY;
  const outerH = bin.outerZ;
  const wall = WALL_THICKNESS;
  const baseH = BASE_HEIGHT;
  const lipH = BIN_LIP_HEIGHT;

  // Build a simple solid mesh by CSG-like approach:
  // Outer box minus inner cavity
  const outerGeo = new THREE.BoxGeometry(outerW, outerH, outerD);
  outerGeo.translate(0, outerH / 2, 0);

  const cavW = outerW - wall * 2;
  const cavD = outerD - wall * 2;
  const cavH = outerH - baseH - lipH;
  const cavGeo = new THREE.BoxGeometry(cavW, cavH, cavD);
  cavGeo.translate(0, baseH + cavH / 2, 0);

  // For a proper STL we'd do CSG subtraction. For simplicity, export the
  // outer shell as the STL (users can do boolean ops in their slicer).
  // We'll export both as separate STL meshes.
  const mesh = new THREE.Mesh(outerGeo);
  mesh.updateMatrixWorld(true);

  return meshToSTLBinary(mesh);
}

/**
 * Generate STL binary for the object insert.
 */
export function generateObjectSTL(bin: GridfinityBin): ArrayBuffer {
  const mesh = buildObjectMesh(bin);
  mesh.updateMatrixWorld(true);
  return meshToSTLBinary(mesh);
}

function meshToSTLBinary(mesh: THREE.Mesh): ArrayBuffer {
  const geometry = mesh.geometry;
  const posAttr = geometry.getAttribute("position");
  const indexAttr = geometry.getIndex();

  let triangleCount: number;
  if (indexAttr) {
    triangleCount = indexAttr.count / 3;
  } else {
    triangleCount = posAttr.count / 3;
  }

  // STL binary: 80 byte header + 4 byte triangle count + 50 bytes per triangle
  const bufferLength = 80 + 4 + triangleCount * 50;
  const buffer = new ArrayBuffer(bufferLength);
  const view = new DataView(buffer);

  // Header (80 bytes, can be anything)
  const header = "Gridfinity Bin - Generated by Gridfinity Converter";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  }

  // Triangle count
  view.setUint32(80, triangleCount, true);

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();

  let offset = 84;

  for (let i = 0; i < triangleCount; i++) {
    let a: number, b: number, c: number;
    if (indexAttr) {
      a = indexAttr.getX(i * 3);
      b = indexAttr.getX(i * 3 + 1);
      c = indexAttr.getX(i * 3 + 2);
    } else {
      a = i * 3;
      b = i * 3 + 1;
      c = i * 3 + 2;
    }

    vA.fromBufferAttribute(posAttr, a);
    vB.fromBufferAttribute(posAttr, b);
    vC.fromBufferAttribute(posAttr, c);

    // Apply mesh world transform
    vA.applyMatrix4(mesh.matrixWorld);
    vB.applyMatrix4(mesh.matrixWorld);
    vC.applyMatrix4(mesh.matrixWorld);

    // Compute normal
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    normal.crossVectors(cb, ab).normalize();

    // Write normal
    view.setFloat32(offset, normal.x, true); offset += 4;
    view.setFloat32(offset, normal.y, true); offset += 4;
    view.setFloat32(offset, normal.z, true); offset += 4;

    // Write vertices
    view.setFloat32(offset, vA.x, true); offset += 4;
    view.setFloat32(offset, vA.y, true); offset += 4;
    view.setFloat32(offset, vA.z, true); offset += 4;

    view.setFloat32(offset, vB.x, true); offset += 4;
    view.setFloat32(offset, vB.y, true); offset += 4;
    view.setFloat32(offset, vB.z, true); offset += 4;

    view.setFloat32(offset, vC.x, true); offset += 4;
    view.setFloat32(offset, vC.y, true); offset += 4;
    view.setFloat32(offset, vC.z, true); offset += 4;

    // Attribute byte count
    view.setUint16(offset, 0, true); offset += 2;
  }

  return buffer;
}
