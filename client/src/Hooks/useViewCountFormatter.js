import { useState } from "react";
import _ from "lodash";

export const useViewCountFormatter = () => {
  const [viewCount, setViewCount] = useState({});

  const processVideo2ViewCountObj = (video2ViewCountObj) => {
    const video_viewCount = _.mapValues(
      video2ViewCountObj,
      (video2ViewCount) => {
        return formatViewCount(video2ViewCount);
      }
    );
    setViewCount(video_viewCount);
  };

  const formatViewCount = (viewCount) => {
    let flViewCount = 0,
      distinction = 1,
      suffix = "";
    if (viewCount >= 1e9) {
      distinction = 1e9;
      suffix = "B";
    } else if (viewCount >= 1e6) {
      distinction = 1e6;
      suffix = "M";
    } else if (viewCount >= 1e3) {
      distinction = 1e3;
      suffix = "K";
    }
    viewCount = viewCount / distinction;
    flViewCount = (Math.floor(viewCount * 100) / 100).toString().slice(0, 3); //parseFloat(viewCount.toFixed(1));
    flViewCount =
      flViewCount[2] === 0 ? parseInt(flViewCount) : parseFloat(flViewCount);
    viewCount = `${
      flViewCount % 10 === flViewCount
        ? flViewCount
        : Math.floor(viewCount).toFixed()
    }${suffix}`;
    return viewCount;
  };

  return [viewCount, processVideo2ViewCountObj];
};
