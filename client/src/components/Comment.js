import React, { useState, useEffect } from "react";

/**Libraries */
import { decode } from "he";
import ReactHtmlParser from "react-html-parser";

/**I Authored */
import LikesDislikes from "./LikesDislikes";
import { FourCorners } from "./Placeholder";

const Comment = ({ comment, howLongAgo, likeCount }) => {
  const {
    id,
    snippet: {
      authorChannelUrl,
      authorDisplayName,
      authorProfileImageUrl,
      textDisplay,
      updatedAt,
      publishedAt,
    },
  } = comment.snippet.topLevelComment;

  /**states ********************************************************************/

  const [commentClicked, setCommentClicked] = useState({});
  const [comImgLoaded, setComImgLoaded] = useState({});

  /***************************************************************************** */

  /**Effects *********************************************************************/

  useEffect(() => {
    setComImgLoaded({ ...comImgLoaded, [comment.id]: true });
  }, [comment]);

  /****************************************************************************** */

  /**Helper functions ************************************************************************************/

  const toDate = (date) => {
    if (date != null) return new Date(date);
  };

  const handleCommentClick = () => {
    setCommentClicked({ ...commentClicked, [id]: !commentClicked[id] });
  };

  const handleImageLoaded = () => {
    setComImgLoaded({ ...comImgLoaded, [id]: !comImgLoaded[id] });
  };

  /*********************************************************************************************************8 */

  return (
    <div className="commentWrap">
      <div className="avatarChannel">
        {comImgLoaded[id] ? (
          <FourCorners
            type="square"
            styles={{
              position: "relative",
              width: "40px",
              borderRadius: "30px",
              zIndex: "99",
            }}
          />
        ) : null}
        <a
          href={authorChannelUrl}
          className={`${comImgLoaded[id] ? "hidden" : ""}`}
        >
          <img
            alt={authorDisplayName}
            src={authorProfileImageUrl}
            onLoad={handleImageLoaded}
          />
        </a>
      </div>
      <div className="cContent">
        <div className="cAuthor" style={{ color: "#ffffff" }}>
          {decode(authorDisplayName)}
          <span
            style={{
              color: "gainsboro",
              fontSize: "13px",
              marginInlineStart: "0.8rem",
            }}
          >{`${howLongAgo} ago ${
            toDate(updatedAt).getTime() !== toDate(publishedAt).getTime()
              ? "(edited)"
              : ""
          }`}</span>
        </div>
        <div
          className="cText"
          style={{
            color: "#BDBDBD",
            WebkitLineClamp: commentClicked[id] ? "" : "2",
            cursor: "pointer",
          }}
          onClick={handleCommentClick}
        >
          {ReactHtmlParser(textDisplay)}
        </div>
        <div className="cCaptions">
          <LikesDislikes likeCount={likeCount} gridSpace="flex-start" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Comment);
