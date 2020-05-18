import "../styles/Header.css";
import React from "react";
import SearchBar from "./SearchBar";
import logo from "../assets/youTubelogo.png";
import { DEFAULT_SEARCH } from "../helper/constants";
import history from "../history";

/**Libraries */
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";

const Header = ({ showProgressBar, isTheatre, online }) => {
  const ColorLinearProgress = withStyles({
    colorPrimary: { backgroundColor: "red" },
    barColorPrimary: { backgroundColor: "#ffffff" },
  })(LinearProgress);

  const handleLogoClick = (event) => {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("q") && DEFAULT_SEARCH !== urlParams.get("q")) {
      history.push(`/search?q=${DEFAULT_SEARCH}`);
    }
    urlParams = null;
  };

  return (
    <>
      {showProgressBar ? <ColorLinearProgress /> : null}
      <div className={`headGrid${isTheatre ? " hide" : ""}`}>
        <div className={`logo${!online ? " hide" : ""}`}>
          <img src={logo} alt="NotYoutube" onClick={handleLogoClick} />
        </div>
        <div className={`searchBarItem${!online ? " hide" : ""}`}>
          <SearchBar />
        </div>
        <div style={{ gridArea: "1/9/1/11" }}></div>
      </div>
    </>
  );
};

export default Header;
