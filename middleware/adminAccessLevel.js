const User = require("../model/User");

module.exports = async function (req, res, next) {
  const user = await User.findById(req.user._id);

  if (user.permissionLevel !== 1) {
    return res.status(403).send("Forbidden");
  }
  next();
};
