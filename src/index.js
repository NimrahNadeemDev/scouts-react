import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";

// APIProvider from vis.gl
import { APIProvider } from "@vis.gl/react-google-maps";

// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider, SnackbarProvider } from "context";

const container = document.getElementById("app");
const root = createRoot(container);

// Load API key from environment variable with fallback
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCS-DB39Kk-Z25C5GWymVGshXIALbjXPGY";

console.log("🗺️ Environment Mode:", import.meta.env.MODE);
console.log(
  "🗺️ API Key Source:",
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "Environment Variable ✅" : "Fallback (Hardcoded) ⚠️"
);

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <SnackbarProvider>
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
          <App />
        </APIProvider>
      </SnackbarProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
