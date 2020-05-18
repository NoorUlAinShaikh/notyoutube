import React, { useEffect, useState } from "react";

/**Libraries */
import _ from "lodash";

/**I Authored */
import OneVideo from "./OneVideo";
import { useViewCountFormatter } from "../Hooks/useViewCountFormatter";
import { useHowLongAgo } from "../Hooks/useHowLongAgo";

/**CSS */
import "../styles/VideoList.css";

const VideoList = ({ videos, handleVideoSelection, vFeatures }) => {
  /**States ************************************************************************************/

  const [imgLoading, setImgLoading] = useState({});

  /******************************************************************************************** */

  /**Hooks ***************************************************************************************/

  const [ageing, setvideo2DateObj] = useHowLongAgo();
  const [viewCount, setVideo2ViewCountObj] = useViewCountFormatter();

  /******************************************************************************************** */

  /**Effects **************************************************************************************/

  useEffect(() => {
    const video2Date = _.mapValues(vFeatures, (vid) => vid.snippet.publishedAt);
    setvideo2DateObj(video2Date);

    const video2viewCount = _.mapValues(
      vFeatures,
      (vid) => vid.statistics.viewCount
    );
    setVideo2ViewCountObj(video2viewCount);
  }, [vFeatures]);

  useEffect(() => {
    const imgLoaded = Object.assign(
      {},
      ...videos.map((video) => {
        return {
          [video.id.videoId]: true,
        };
      })
    );
    setImgLoading(imgLoaded);
  }, []);

  /******************************************************************************************** */

  /**HelperFunctions ***********************************************************************************/

  const setImgLoaded = (id) => {
    setImgLoading({ ...imgLoading, [id]: false });
  };

  /**************************************************************************************************** */
  let id;
  return (
    <div className="videosWrap">
      {videos.map((video, index) => {
        id = video.id.videoId;
        return (
          <OneVideo
            key={`${id}${index}`}
            video={video}
            handleVideoSelection={handleVideoSelection}
            features={vFeatures[id]}
            publishedAt={ageing[id]}
            viewCount={viewCount[id]}
            imgLoading={imgLoading[id]}
            setImgLoaded={setImgLoaded}
          />
        );
      })}
    </div>
  );
};

export default React.memo(VideoList);
