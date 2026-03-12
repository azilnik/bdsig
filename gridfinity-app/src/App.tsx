import { useState } from "react";
import DimensionForm from "./components/DimensionForm";
import Viewer3D from "./components/Viewer3D";
import BinInfo from "./components/BinInfo";
import ExportButtons from "./components/ExportButtons";
import {
  calculateBin,
  type ObjectDimensions,
  type GridfinityBin,
} from "./gridfinity";
import "./App.css";

function App() {
  const [bin, setBin] = useState<GridfinityBin | null>(null);

  const handleGenerate = (dims: ObjectDimensions) => {
    const result = calculateBin(dims);
    setBin(result);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gridfinity Converter</h1>
        <p className="subtitle">
          Enter object dimensions to generate a perfectly-sized Gridfinity bin
        </p>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <DimensionForm onSubmit={handleGenerate} />
          {bin && <BinInfo bin={bin} />}
          {bin && <ExportButtons bin={bin} />}
        </aside>

        <main className="main-panel">
          {bin ? (
            <Viewer3D bin={bin} />
          ) : (
            <div className="placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">&#x25A6;</div>
                <p>
                  Enter dimensions and click "Generate" to preview your
                  Gridfinity bin
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
