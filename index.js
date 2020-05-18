const express = require("express");
const { PRODUCTION } = require("./helpers/constants");
const { handleError } = require("./helpers/error");

const app = express();

//required to append 'post/put/patch' request body to the 'req' object
app.use(express.json());

require("./routes/fetchRoutes")(app);

if (process.env.NODE_ENV === PRODUCTION) {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.use((err, req, res, next) => {
  handleError(err, res);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
