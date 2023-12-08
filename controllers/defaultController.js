const displayJson = require("./../utils/displayJson");

const defaultController = async (req, res) => {
  res.sendStatus(200);
  res.send(displayJson(false, "home page", "welcome to simple blog"));
};

module.exports = defaultController;
