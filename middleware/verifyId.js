const User = require("../model/User");

module.exports = async function (req, res, next) {
  // Check the user id via session  === to req.params.id
  if (req.user._id !== req.params.id) {

    // if not checks the Users in DB to see if that request is from a Admin or not
    const user = await User.findById(req.user._id);
    if (user.permissionLevel !== 1) {
      return res.status(403).send("Forbidden");
    }
  }
  next();
};
