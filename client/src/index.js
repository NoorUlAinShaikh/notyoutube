import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import NYouTubeApp from "./components/NYouTubeApp";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <React.StrictMode>
    <NYouTubeApp />
  </React.StrictMode>,
  document.getElementById("hook")
);

// serviceWorker.register();
