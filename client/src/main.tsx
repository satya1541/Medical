import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, initPWAInstallPrompt, initNetworkStatusDetection } from "./pwa";

// Initialize PWA features
registerServiceWorker();
initPWAInstallPrompt();
initNetworkStatusDetection();

createRoot(document.getElementById("root")!).render(<App />);
