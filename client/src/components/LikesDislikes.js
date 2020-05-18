import React from "react";
import { THUMBS_UP, THUMBS_DOWN } from "../helper/constants";

const LikesDislikes = ({
  gridSpace,
  likeCount = 0,
  dislikeCount = 0,
  actual = {},
}) => {
  const gridStyle = {
    justifyContent: gridSpace,
    margin: gridSpace === "space-between" ? "0 1rem 0 1rem" : "",
  };
  return (
    <>
      <div className="gridWrap" style={gridStyle}>
        <div id="likes">
          <i className="material-icons" style={{ fontSize: "20px" }}>
            {THUMBS_UP}
          </i>
          <span className="right">{likeCount}</span>
        </div>
        <div id="dislikes">
          <i className="material-icons" style={{ fontSize: "20px" }}>
            {THUMBS_DOWN}
          </i>
          <span className="right">{dislikeCount}</span>
        </div>
      </div>
      {gridSpace === "space-between" ? (
        <progress
          style={{
            borderRadius: "0px",
            height: "0.12rem",
            width: "-webkit-fill-available",
            minWidth: "100%",
          }}
          max={parseInt(actual.likeCount) + parseInt(actual.dislikeCount)}
          value={parseInt(actual.likeCount)}
        />
      ) : null}
    </>
  );
};

export default React.memo(LikesDislikes);
