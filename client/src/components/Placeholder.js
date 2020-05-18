import React from "react";

export const Line = ({ lineLength = "", count = 1, para = false }) => {
  const renderLines = () =>
    [...Array(count)].map((e, index) => (
      <div
        key={index}
        className={`${lineLength} line`}
        style={{ backgroundColor: "#111111" }}
      ></div>
    ));

  return (
    <div
      className="ui inverted placeholder"
      style={{ margin: "2px", height: "fit-content" }}
    >
      {para ? <div className="paragraph">{renderLines()}</div> : renderLines()}
    </div>
  );
};

export const FourCorners = ({ type = "square", styles = {} }) => {
  return (
    <div className="ui inverted placeholder" style={styles}>
      <div className={`${type} image`}></div>
    </div>
  );
};
