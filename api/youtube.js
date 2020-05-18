const axios = require("axios");
const { baseURL, searchSuggestions } = require("../helpers/constants");
const { youtubeAPIKEY } = require("../config/keys");

const params = { maxResults: 20, key: youtubeAPIKEY };

const youtube = axios.create({
  baseURL,
  params: {
    ...params,
    type: "video",
    order: "relevance",
    videoEmbeddable: true,
  },
});

const vanilla = axios.create({ baseURL, params });

const searchSuggestion = axios.create({
  baseURL: searchSuggestions,
  params: {
    hl: "en",
    ds: "yt",
    client: "youtube",
    hjson: "t",
    cp: 1,
    format: 5,
    alt: "json",
  },
});

module.exports = { youtube, vanilla, searchSuggestion };
