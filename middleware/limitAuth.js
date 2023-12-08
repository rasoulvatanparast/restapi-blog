module.exports = async function (req, res, next) {
  if (req.session.authorization) return res.status(400).send();
  // console.log(req.session.authorization);
  next();
};
