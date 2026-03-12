import type { GridfinityBin } from "../gridfinity";
import { generateBinSTL, generateObjectSTL } from "../stlExport";

interface Props {
  bin: GridfinityBin;
}

function downloadBlob(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ bin }: Props) {
  const binName = `gridfinity_${bin.gridX}x${bin.gridY}x${bin.gridZ}`;

  return (
    <div className="export-buttons">
      <h2>Export 3D Models</h2>
      <div className="button-row">
        <button
          className="export-btn"
          onClick={() => {
            const stl = generateBinSTL(bin);
            downloadBlob(stl, `${binName}_bin.stl`);
          }}
        >
          Download Bin STL
        </button>
        <button
          className="export-btn export-btn-secondary"
          onClick={() => {
            const stl = generateObjectSTL(bin);
            downloadBlob(
              stl,
              `${binName}_object_${bin.object.x}x${bin.object.y}x${bin.object.z}.stl`
            );
          }}
        >
          Download Object STL
        </button>
      </div>
      <p className="export-note">
        STL files can be imported into slicers like PrusaSlicer, Cura, or
        BambuStudio for 3D printing.
      </p>
    </div>
  );
}
