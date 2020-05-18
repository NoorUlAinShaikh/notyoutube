import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { throttle } from "lodash";
import grainyCover from "../assets/grainyCover.png";
import _404 from "../assets/not404.png";
import "../styles/_404.css";

const Found404 = () => {
  const [smallWindow, setSmallWindow] = useState(false);

  useEffect(() => {
    window.addEventListener("resize", throttle(handleWindowResize), 300);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const handleWindowResize = () => {
    setSmallWindow(window.matchMedia("(max-width: 800px)").matches);
  };

  return (
    <>
      <div className="grainy">
        <img
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
          src={grainyCover}
          alt="grainycover"
        />
      </div>
      <div className="_404">
        <div style={{ justifySelf: "center", padding: "3rem" }}>
          <img
            src={_404}
            alt="Your are not invited here!"
            style={{ width: "100%", minWidth: "200px", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            padding: "2.5rem 1rem",
            fontSize: "2.5em",
            justifySelf: smallWindow ? "center" : "flex-start",
          }}
        >
          <span>Away with you then... </span>
          <br />
          <span>Oh wait.. here.. </span>
          <div id="link404" style={{ marginTop: "1.5rem" }}>
            <NavLink exact to="/search">
              An early Christmas present!
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Found404;
