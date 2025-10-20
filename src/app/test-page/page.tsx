"use client";

import styles from "./styles.module.css";

export default function TestPage() {
  // Button click handlers
  const handleInlineButtonClick = () => {
    alert("Inline style button clicked!");
  };

  const handleCssModuleButtonClick = () => {
    alert("CSS Module button clicked!");
  };

  const handleTailwindButtonClick = () => {
    alert("Tailwind button clicked!");
  };

  return (
    <div>
      {/* Inline styles section */}
      <div style={{ padding: "20px" }}>
        <h1 style={{ color: "green", fontSize: "32px" }}>
          Test Page with Inline Styles
        </h1>

        <div
          style={{
            border: "3px solid purple",
            backgroundColor: "lightblue",
            padding: "20px",
            margin: "20px 0",
            borderRadius: "10px",
          }}
        >
          <p style={{ fontWeight: "bold" }}>
            This is a test page with inline styles. If you can see the styling,
            then React is working correctly.
          </p>
        </div>

        <button
          style={{
            backgroundColor: "blue",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleInlineButtonClick}
        >
          Test Button
        </button>
      </div>

      {/* CSS Module section */}
      <div className={styles.container}>
        <h2 className={styles.title}>CSS Module Test</h2>

        <div className={styles.card}>
          <p>
            This section is styled using CSS Modules. If you can see the
            styling, then CSS Modules are working correctly.
          </p>
        </div>

        <button className={styles.button} onClick={handleCssModuleButtonClick}>
          CSS Module Button
        </button>
      </div>

      {/* Tailwind CSS section */}
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            Tailwind CSS Test
          </div>
          <p className="mt-2 text-gray-500">
            This section is styled using Tailwind CSS. If you can see the
            styling, then Tailwind CSS is working correctly.
          </p>
          <button
            className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            onClick={handleTailwindButtonClick}
          >
            Tailwind Button
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
