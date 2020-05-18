import React, { useEffect } from "react";
import {
  CODE_403_TITLE,
  CODE_403_MESSAGE,
  NO_RESULTS_TITLE,
  NO_RESULTS,
  CODE_500_TITLE,
  CODE_500_MESSAGE,
} from "../helper/constants";

export const ShowError = ({
  noResults,
  searchValue,
  error,
  errorCode = 500,
  errorResponse,
}) => {
  useEffect(() => {
    document.body.classList.add("gradient");
    return () => {
      document.body.classList.remove("gradient");
    };
  }, []);

  const renderErrorAnatomy = (title = [], para = "") => {
    return (
      <>
        <span>
          {`${title[0]} `}
          {title.length > 1 ? (
            <span style={{ fontStyle: "italic" }}>{title[1]}</span>
          ) : null}
        </span>
        <p style={{ padding: "15px", whiteSpace: "pre-wrap" }}>{para}</p>
      </>
    );
  };

  return (
    <div className="ui raised inverted segment background">
      <a
        href="#error"
        className={`ui ${error ? "red" : "yellow"} ribbon label`}
      >
        {error ? "Error" : ""}
      </a>
      {error
        ? errorCode === 403
          ? renderErrorAnatomy([CODE_403_TITLE], CODE_403_MESSAGE)
          : renderErrorAnatomy([CODE_500_TITLE], CODE_500_MESSAGE)
        : noResults
        ? renderErrorAnatomy([NO_RESULTS_TITLE, searchValue], NO_RESULTS)
        : null}
    </div>
  );
};
