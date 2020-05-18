import { useState } from "react";
import _ from "lodash";

export const useHowLongAgo = () => {
  const [howLongAgo, setHowLongAgo] = useState([]);

  const processWhatever2DateObj = (whatever2DateObj) => {
    const whatever_Date = _.mapValues(whatever2DateObj, (whatever2Date) =>
      calculateTimePast(whatever2Date)
    );
    setHowLongAgo(whatever_Date);
  };

  const calculateTimePast = (publishedAt) => {
    const postedAgo = (Date.now() - new Date(publishedAt).getTime()) / 1000;

    //secondsAgo
    const secs = Math.floor(postedAgo);
    if (secs < 60) return secs > 1 ? `${secs} seconds` : `${secs} second`;

    //minutesAgo
    const minutes = Math.floor(secs / 60);
    if (minutes < 60)
      return minutes > 1 ? `${minutes} minutes` : `${minutes} minute`;

    //hoursAgo
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours > 1 ? `${hours} hours` : `${hours} hour`;

    //daysAgo
    const days = Math.floor(hours / 24);
    if (days < 7) return days > 1 ? `${days} days` : `${days} day`;

    //weeksAgo
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks > 1 ? `${weeks} weeks` : `${weeks} week`;

    //monthsAgo
    const months = Math.floor(weeks / 4);
    if (months < 12) return months > 1 ? `${months} months` : `${months} month`;

    //yearsAgo
    const years = Math.floor(months / 12);
    return years > 1 ? `${years} years` : `${years} year`;
  };

  return [howLongAgo, processWhatever2DateObj];
};
