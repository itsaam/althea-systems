"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div
        style={{
          background: "#1a1a2e",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
          ALTHEA SYSTEMS
        </span>
        <span
          style={{
            background: "#4f46e5",
            color: "white",
            padding: "2px 10px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          API Docs
        </span>
      </div>
      <SwaggerUI
        url="/api/docs"
        docExpansion="list"
        defaultModelsExpandDepth={-1}
        tryItOutEnabled={true}
      />
    </div>
  );
}