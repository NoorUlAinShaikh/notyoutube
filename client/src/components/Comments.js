import React, { useEffect, useRef } from "react";

/**Libraries */
import { useCountUp } from "react-countup";
import VisibilitySensor from "react-visibility-sensor";

/**I Authored */
import { useHowLongAgo } from "../Hooks/useHowLongAgo";
import { useViewCountFormatter } from "../Hooks/useViewCountFormatter";
import {
  COMMENTS_END,
  LOADING_COMMENTS,
  OFFLINE_MESSAGE,
} from "../helper/constants";
import Comment from "./Comment";

/**CSS & Others*/
import "../styles/Comment.css";

const Comments = ({
  comments = {},
  showLoadMoreComments = false,
  commentCount = 0,
  loadMoreComments,
  lastCommentsPage = false,
  online,
}) => {
  /**Hooks **************************************************************************************/

  const [howLongAgo, setComment2DateArray] = useHowLongAgo();
  const [
    commentsDis_likeDCount,
    processCommentsDis_likeCount,
  ] = useViewCountFormatter();

  const { countUp, update } = useCountUp({
    end: commentCount,
    start: 0,
    duration: 2,
    separator: ",",
  });

  const commentsWrapper = useRef(null);

  /******************************************************************************************** */

  /**Effects ******************************************************************************************/

  useEffect(() => {
    if (comments != null) {
      const comment2Date = Object.assign(
        {},
        ...comments.map((comment) => {
          return {
            [comment.id]: comment.snippet.topLevelComment.snippet.publishedAt,
          };
        })
      );
      setComment2DateArray(comment2Date);

      const commentsDis_like = Object.assign(
        {},
        ...comments.map((comment) => {
          return {
            [comment.id]: comment.snippet.topLevelComment.snippet.likeCount,
          };
        })
      );
      processCommentsDis_likeCount(commentsDis_like);
    }
  }, [comments]);

  useEffect(() => {
    update(commentCount);
  }, [commentCount]);

  /*************************************************************************************************** */

  /**HelperFunctions ***********************************************************************************/

  const handleCommentInView = (isVisible) => {
    if (isVisible) {
      update(commentCount);
    }
  };

  const fireLoadMoreComments = (isVisible) => {
    if (isVisible) {
      loadMoreComments();
    }
  };

  const renderResult = (text) => {
    return (
      <div
        className="ui inverted segment fluid"
        style={{
          background: "none",
          textAlign: "center",
          padding: "0",
          margin: "0",
          position: "relative",
        }}
      >
        {text}
      </div>
    );
  };

  /**************************************************************************************************** */
  let id;
  return (
    <>
      <br />
      <VisibilitySensor onChange={handleCommentInView}>
        <div
          style={{ color: "#ffffff", fontSize: "20px" }}
        >{`${countUp} Comments`}</div>
      </VisibilitySensor>
      <br /> <br />
      <div
        id="commentsWrap"
        ref={commentsWrapper}
        style={
          showLoadMoreComments
            ? {
                maxHeight: "80vh",
                overflowY: "auto",
                marginBottom: "2.5rem",
              }
            : { maxHeight: "auto" }
        }
      >
        {comments !== null
          ? comments.map((comment) => {
              id = comment.id;
              return (
                <Comment
                  key={id}
                  comment={comment}
                  howLongAgo={howLongAgo[id]}
                  likeCount={commentsDis_likeDCount[id]}
                />
              );
            })
          : null}

        <br />
        {comments !== null && lastCommentsPage ? (
          renderResult(COMMENTS_END)
        ) : (
          <VisibilitySensor
            onChange={fireLoadMoreComments}
            containment={showLoadMoreComments ? commentsWrapper.current : null}
          >
            {renderResult(online ? LOADING_COMMENTS : OFFLINE_MESSAGE)}
          </VisibilitySensor>
        )}
      </div>
    </>
  );
};

// Comments.whyDidYouRender = true;
export default React.memo(Comments);
