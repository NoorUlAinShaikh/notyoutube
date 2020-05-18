import React from "react";

/**Libraries */
import { decode } from "he";

/**I Authored */
import { Line } from "./Placeholder";
import { FourCorners } from "./Placeholder";

/**CSS */
import "../styles/OneVideo.css";

const OneVideo = ({
  video,
  handleVideoSelection,
  features = {},
  publishedAt,
  viewCount,
  imgLoading = true,
  setImgLoaded,
}) => {
  /**Object deafults Initialization ************************************************/
  const {
    thumbnails: {
      medium: { url },
    },
    title = null,
    channelTitle = null,
  } = video.snippet;

  const { contentDetails: { duration } = { duration: "" } } = features
    ? features
    : {};

  /********************************************************************************** */

  /**HelperFunctions **********************************************************************************/

  const formatDuration = (duration) => {
    if (!duration) return;
    if (/0S|00S|0|0D|D/.test(duration)) return "Live";
    if (/H|M|S/.test(duration)) {
      let hrs = "",
        mins = "",
        secs = "";

      duration.match(/(\d+)H|(\d+)M|(\d+)S/g).forEach((i) => {
        if (i.includes("H")) {
          hrs = i.replace("H", "");
        } else if (i.includes("M")) {
          mins = i.replace("M", "");
        } else if (i.includes("S")) {
          secs = i.length > 2 ? i.replace("S", "") : `0${i.replace("S", "")}`;
        }
      });

      return `${hrs ? `${hrs}:` : ""}${
        mins ? (hrs && mins.length < 2 ? `0${mins}:` : `${mins}:`) : "00:"
      }${secs ? `${secs}` : "00"}`;
    } else {
      return duration;
    }
  };

  /************************************************************************************** */

  return (
    <>
      <div className="wrap" onClick={() => handleVideoSelection(video)}>
        <div className="imgColumn">
          {duration !== "" ? (
            <div className="vDuration">
              {formatDuration(duration.substring(2))}
            </div>
          ) : null}
          <img
            className="thumbnail"
            src={url}
            alt={title}
            onLoad={() => setImgLoaded(video.id.videoId)}
          />
          {imgLoading ? (
            <FourCorners
              type="square"
              styles={{ position: "absolute", width: "180px", height: "100px" }}
            ></FourCorners>
          ) : null}
        </div>
        <div className="wrapper">
          <div
            className="title"
            style={{ color: "whitesmoke", fontWeight: "600" }}
          >
            {decode(title)}
          </div>
          {channelTitle !== null ? (
            <div className="channel">{channelTitle}</div>
          ) : (
            <Line />
          )}
          {publishedAt ? (
            <div className="postedTime">
              {viewCount} views &bull; {`${publishedAt} ago`}
            </div>
          ) : (
            <Line lineLength="long" />
          )}
        </div>
      </div>
    </>
  );
};

export default OneVideo;
