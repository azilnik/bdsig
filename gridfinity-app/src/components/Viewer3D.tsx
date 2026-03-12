import { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { GridfinityBin } from "../gridfinity";
import { WALL_THICKNESS, BASE_HEIGHT, BIN_LIP_HEIGHT } from "../gridfinity";

interface Props {
  bin: GridfinityBin;
}

function BinMesh({ bin }: { bin: GridfinityBin }) {
  const outerW = bin.outerX;
  const outerD = bin.outerY;
  const outerH = bin.outerZ;
  const wall = WALL_THICKNESS;
  const baseH = BASE_HEIGHT;
  const lipH = BIN_LIP_HEIGHT;
  const cavH = outerH - baseH - lipH;

  return (
    <group>
      {/* Outer shell - translucent blue */}
      <mesh position={[0, outerH / 2, 0]}>
        <boxGeometry args={[outerW, outerH, outerD]} />
        <meshStandardMaterial
          color="#4a90d9"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer shell wireframe */}
      <mesh position={[0, outerH / 2, 0]}>
        <boxGeometry args={[outerW, outerH, outerD]} />
        <meshBasicMaterial color="#2a5a99" wireframe />
      </mesh>

      {/* Inner cavity outline */}
      <mesh position={[0, baseH + cavH / 2, 0]}>
        <boxGeometry
          args={[outerW - wall * 2, cavH, outerD - wall * 2]}
        />
        <meshBasicMaterial color="#6ab0ff" wireframe />
      </mesh>

      {/* Base plate - solid */}
      <mesh position={[0, baseH / 2, 0]}>
        <boxGeometry args={[outerW - 0.1, baseH, outerD - 0.1]} />
        <meshStandardMaterial color="#3a7abf" transparent opacity={0.5} />
      </mesh>

      {/* Grid lines on base */}
      {Array.from({ length: bin.gridX + 1 }).map((_, i) => {
        const xPos = -outerW / 2 + i * 42;
        return (
          <mesh key={`gx-${i}`} position={[xPos, baseH + 0.05, 0]}>
            <boxGeometry args={[0.3, 0.1, outerD]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        );
      })}
      {Array.from({ length: bin.gridY + 1 }).map((_, i) => {
        const zPos = -outerD / 2 + i * 42;
        return (
          <mesh key={`gy-${i}`} position={[0, baseH + 0.05, zPos]}>
            <boxGeometry args={[outerW, 0.1, 0.3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        );
      })}
    </group>
  );
}

function ObjectMesh({ bin }: { bin: GridfinityBin }) {
  const obj = bin.object;
  const r = Math.min(
    obj.cornerRadius,
    obj.x / 2 - 0.01,
    obj.y / 2 - 0.01
  );
  const baseH = BASE_HEIGHT;

  const geometry = useMemo(() => {
    if (r > 0.1) {
      const shape = new THREE.Shape();
      const hw = obj.x / 2;
      const hh = obj.y / 2;
      const cr = Math.min(r, hw - 0.01, hh - 0.01);

      shape.moveTo(-hw + cr, -hh);
      shape.lineTo(hw - cr, -hh);
      shape.quadraticCurveTo(hw, -hh, hw, -hh + cr);
      shape.lineTo(hw, hh - cr);
      shape.quadraticCurveTo(hw, hh, hw - cr, hh);
      shape.lineTo(-hw + cr, hh);
      shape.quadraticCurveTo(-hw, hh, -hw, hh - cr);
      shape.lineTo(-hw, -hh + cr);
      shape.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: obj.z,
        bevelEnabled: false,
      });
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, obj.z, 0);
      return geo;
    }
    return new THREE.BoxGeometry(obj.x, obj.z, obj.y);
  }, [obj.x, obj.y, obj.z, r]);

  const yOffset = r > 0.1 ? baseH : baseH + obj.z / 2;

  return (
    <mesh position={[0, yOffset, 0]} geometry={geometry}>
      <meshStandardMaterial
        color="#f5a623"
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function Viewer3D({ bin }: Props) {
  const maxDim = Math.max(bin.outerX, bin.outerY, bin.outerZ);
  const camDist = maxDim * 1.8;

  return (
    <div className="viewer-3d">
      <Canvas
        camera={{
          position: [camDist * 0.7, camDist * 0.6, camDist * 0.7],
          fov: 45,
          near: 0.1,
          far: maxDim * 20,
        }}
        style={{ background: "#1a1a2e" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[100, 200, 100]} intensity={0.8} />
        <directionalLight position={[-100, 100, -100]} intensity={0.3} />

        <BinMesh bin={bin} />
        <ObjectMesh bin={bin} />

        <Grid
          args={[500, 500]}
          cellSize={42}
          cellThickness={0.6}
          cellColor="#4a4a6a"
          sectionSize={42 * 4}
          sectionThickness={1}
          sectionColor="#6a6a9a"
          fadeDistance={400}
          position={[0, -0.01, 0]}
        />

        <OrbitControls
          makeDefault
          minDistance={10}
          maxDistance={maxDim * 5}
        />
      </Canvas>
    </div>
  );
}
