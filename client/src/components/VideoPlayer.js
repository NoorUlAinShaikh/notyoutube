import React, { useState, useEffect, useRef } from "react";

/**Libraries */
import Grid from "@material-ui/core/Grid";
import { decode } from "he";
import Linkify from "linkifyjs/react";
import { useCountUp } from "react-countup";

/**I Authored */
import Comments from "./Comments";
import LikesDislikes from "./LikesDislikes";
import { useViewCountFormatter } from "../Hooks/useViewCountFormatter";
import { FourCorners, Line } from "./Placeholder";
import { SHOW_MORE, SHOW_LESS } from "../helper/constants";

/** CSS */
import "../styles/VideoPlayer.css";

const VideoPlayer = ({
  video,
  comments,
  isTheatre,
  showLoadMoreComments,
  vFeatures,
  cFeatures,
  smallWindow,
  loadMoreComments,
  lastCommentsPage,
  online,
}) => {
  const videoURL = `https://www.youtube.com/embed/${video.id.videoId}?modestbranding=1&autoplay=1`;

  /**Objects initialization **************************************************************************************/
  const { title, channelTitle, publishedAt, channelId } = video.snippet;
  const {
    snippet: { tags, description } = { tags: [], description: "" },
    statistics: { commentCount, dislikeCount, likeCount, viewCount } = {
      commentCount: 0,
      dislikeCount: 0,
      likeCount: 0,
      viewCount: 0,
    },
  } = vFeatures ? vFeatures : {};

  const {
    snippet: {
      thumbnails: {
        medium: { url },
      },
    } = { thumbnails: { medium: { url: "" } } },
    statistics: { subscriberCount } = { subscriberCount: 0 },
  } = cFeatures ? cFeatures : {};

  const date = new Date(publishedAt)
    .toUTCString()
    .split(" ")
    .slice(0, 4)
    .join(" ");
  let likeDislikeActual = useRef({ likeCount: 0, dislikeCount: 0 });

  /****************************************************************************************/

  /**states **********************************************************************************/

  const [showMore, setShowMore] = useState(false);
  const [descTotalHeight, setDescTotalHeight] = useState("50");
  const [loading, setLoading] = useState({
    videoBlock: true,
    channel: true,
    vtags: true,
  });

  /*******************************************************************************************/

  /**Hooks **************************************************************************************/

  const [
    channelSubcriberCount,
    processchannelSubcriberCount,
  ] = useViewCountFormatter();
  const [
    videoDis_likeDCount,
    processVideoDis_likeDCount,
  ] = useViewCountFormatter();

  const descRef = useRef(null);
  const iframeRef = useRef(null);

  const { countUp, update } = useCountUp({
    end: viewCount,
    start: 1000,
    duration: 3,
    separator: ",",
  });

  /******************************************************************************************** */

  /**Effects **************************************************************************************/

  useEffect(() => {
    if (descRef.current) {
      setDescTotalHeight(descRef.current.scrollHeight);
    }
  }, [description]);

  useEffect(() => {
    if (descTotalHeight > 100) {
      setShowMore(true);
    }
  }, [descTotalHeight]);

  useEffect(() => {
    if (!loading.channel) {
      setLoading({ ...loading, channel: true });
    }
  }, [video]);

  useEffect(() => {
    processchannelSubcriberCount({ [channelId]: subscriberCount });
  }, [cFeatures]);

  useEffect(() => {
    processVideoDis_likeDCount({ like: likeCount, dislike: dislikeCount });
    likeDislikeActual.current = { likeCount, dislikeCount };
    if (loading.vtags) setLoading({ ...loading, vtags: false });
    update(viewCount);
  }, [vFeatures]);

  useEffect(() => {
    if (iframeRef) {
      iframeRef.current.contentWindow.location.replace(videoURL);
      if (!loading.videoBlock) {
        setLoading({ ...loading, videoBlock: true });
      }
    }
  }, [videoURL]);

  useEffect(() => {
    if (iframeRef) {
      iframeRef.current.src = videoURL;
    }
  }, []);

  /********************************************************************************************* */

  /**Helper Functions ***************************************************************************/

  const processTags = (tags, length) => {
    return tags.slice(0, length ? 4 : length).map((t, index) => {
      return (
        <a key={index} style={{ fontSize: "small" }} href="#results">
          {`#${t.split(" ").join("")} `}
        </a>
      );
    });
  };

  const renderVideoDescription = () => (
    <>
      <pre
        ref={descRef}
        style={{
          marginTop: "0.5rem",
          gridArea: "2/1/span 1/1",
          whiteSpace: "pre-wrap",
          overflow: `${showMore ? "hidden" : ""}`,
        }}
      >
        <Linkify tagName="span">{description}</Linkify>
      </pre>
      {descTotalHeight > 100 ? (
        <span
          style={{ marginTop: "0.5rem", cursor: "pointer" }}
          onClick={handleShowMoreClick}
        >
          {showMore ? SHOW_MORE : SHOW_LESS}
        </span>
      ) : null}
    </>
  );

  const handleShowMoreClick = () => {
    if (descRef && !showMore) {
      window.scrollTo({
        top: descRef.current.getBoundingClientRect().top,
      });
    }
    setShowMore(!showMore);
  };

  const handleChannelLoading = () => {
    setLoading({ ...loading, channel: false });
  };

  const renderChannel = () => {
    return (
      <div className="channelWrap" style={{ color: "#F5F5F5" }}>
        <div className="avatarChannels">
          <a
            href={`https://youtube.com/channel/${channelId}`}
            style={loading.channel ? { display: "none" } : {}}
          >
            <img alt={channelTitle} src={url} onLoad={handleChannelLoading} />
          </a>
          {loading.channel ? (
            <FourCorners
              type="square"
              styles={{
                position: "relative",
                maxWidth: "100%",
                borderRadius: "30px",
              }}
            />
          ) : null}
        </div>
        <div
          className="description"
          style={{
            gridTemplateRows: `auto ${showMore ? "100px" : "auto"}`,
          }}
        >
          <div className="titleBox">
            <div style={{ fontWeight: "700", fontSize: "medium" }}>
              {channelTitle}
            </div>
            <div
              style={{ fontSize: "15px", color: "#BDBDBD", margin: "0.1rem" }}
            >
              {`${channelSubcriberCount[channelId]} subscribers`}
            </div>
          </div>
          {loading.channel ? (
            <Line count={3} para={true} />
          ) : (
            renderVideoDescription()
          )}
        </div>
      </div>
    );
  };

  const handleVideoLoading = () => {
    /**disable channel placeholder if not yet disabled */
    setLoading(
      loading.channel
        ? { ...loading, videoBlock: false, channel: false }
        : { ...loading, videoBlock: false }
    );
  };

  /************************************************************************************************** */

  return (
    <div
      style={
        smallWindow || isTheatre
          ? { margin: "0.3rem 1rem 1rem 1rem" }
          : { margin: "1rem 1rem 1rem 2.5rem" }
      }
    >
      <Grid container spacing={0}>
        <Grid id="videoBlock" item xs={12}>
          <div
            style={loading.videoBlock ? { display: "none" } : {}}
            className={`ui ${isTheatre ? "21:9" : ""} embed`}
          >
            <iframe
              ref={iframeRef}
              title={title}
              allowFullScreen
              onLoad={handleVideoLoading}
            ></iframe>
          </div>
          {/* Placeholder */}
          {loading.videoBlock ? (
            <FourCorners
              type="rectangular"
              styles={{
                position: "relative",
                maxWidth: "65rem",
                height: "20rem",
                marginBottom: "0.5rem",
              }}
            ></FourCorners>
          ) : null}
          <div className="titleBox">
            <div style={{ fontSize: "small" }}>
              {!loading.vtags ? (
                tags ? (
                  processTags(tags, tags.length)
                ) : null
              ) : (
                <Line lineLength="full" />
              )}
            </div>
            <div>{decode(title)}</div>
          </div>
          <div className="gridWrap">
            <div className="leftGrid" style={{ marginLeft: "0.2rem" }}>
              <div style={{ display: "contents" }}>
                {`${countUp} views `}
                <span className="bull">&bull;</span>
              </div>
              <div className="date">{date}</div>
            </div>
            <div
              className="rightGrid"
              style={{
                margin: "0 1rem 0 2rem",
              }}
            >
              <LikesDislikes
                gridSpace="space-between"
                likeCount={videoDis_likeDCount["like"]}
                dislikeCount={videoDis_likeDCount["dislike"]}
                actual={likeDislikeActual.current}
              />
            </div>
          </div>
          <div
            className="ui divider"
            style={{
              marginTop: "2px",
              borderTop: "0px",
              backgroundColor: "#424242",
            }}
          />
        </Grid>
        <Grid item xs={12}>
          {renderChannel()}
          <div
            className="ui divider"
            style={{ borderTop: "0px", backgroundColor: "#424242" }}
          />
        </Grid>
        <Grid item xs={12}>
          {comments !== null ? (
            <Comments
              comments={comments}
              showLoadMoreComments={showLoadMoreComments}
              commentCount={commentCount}
              loadMoreComments={loadMoreComments}
              lastCommentsPage={lastCommentsPage}
              online={online}
            />
          ) : null}
        </Grid>
      </Grid>
    </div>
  );
};

// VideoPlayer.whyDidYouRender = true;
export default React.memo(VideoPlayer);
