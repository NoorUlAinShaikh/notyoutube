const { PRODUCTION } = require("../helpers/constants");
if (process.env.NODE_ENV === PRODUCTION) {
  //production
  module.exports = require("./prodKeys");
} else {
  module.exports = require("./devKeys");
}
