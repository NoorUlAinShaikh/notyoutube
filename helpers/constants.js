const SEARCH = "search";

module.exports = {
  baseURL: "https://www.googleapis.com/youtube/v3",
  searchSuggestions: "https://suggestqueries.google.com/complete",
  PRODUCTION: "production",
  SEARCH,
  SUGGESTIONS: "Suggestions",
  ROUTES: [
    SEARCH,
    "commentThreads",
    "videos",
    "channels",
    "getSearchSuggestions",
  ],
  _404ERROR: `Requested page doesn't wanna hang with you!`,
};
