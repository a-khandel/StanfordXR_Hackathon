import { useState } from "react";
import "./App.css";

// ⬇️ import tldraw component + styles
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

function SecondPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="App" style={{ padding: 16 }}>
      <h1>Second Page</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
      </div>

      {/* Whiteboard container: fills most of the viewport and clips nicely */}
      <div
        style={{
          height: "75vh",
          borderRadius: 12,
          overflow: "hidden",
          background: "transparent",
          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
        }}
      >
        <Tldraw />
      </div>
    </div>
  );
}

export default SecondPage;
