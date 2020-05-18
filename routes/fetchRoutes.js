const { youtube, vanilla, searchSuggestion } = require("../api/youtube");
const { ErrorHandler } = require("../helpers/error");
const {
  SEARCH,
  SUGGESTIONS,
  ROUTES,
  _404ERROR,
} = require("../helpers/constants");

module.exports = (app) => {
  //all Routes :p
  app.post("/api/:route", async (req, res, next) => {
    const params = req.body.params;
    const { route } = req.params;
    let response = null;
    if (route !== "" && ROUTES.includes(route)) {
      try {
        if (route.includes(SUGGESTIONS)) {
          response = await searchSuggestion.get(`/${SEARCH}`, {
            params: {
              q: req.body.currentSearchVal,
            },
          });
        } else {
          response = await (route.includes(SEARCH)
            ? youtube
            : vanilla
          ).get(`/${route}`, { params });
        }

        res.json(response.data);
      } catch (error) {
        if (error.response) {
          next(
            new ErrorHandler(error.response.status, error.response.statusText)
          );
        } else {
          next(error);
        }
      }
    } else {
      next(new ErrorHandler(404, _404ERROR));
    }
  });
};
