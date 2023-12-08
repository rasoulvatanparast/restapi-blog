const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../model/User");
const {
  registerValidation,
  loginValidation,
  emailValidation,
  activateValidation,
} = require("../config/validation");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/verifyToken");
const adminAccessLevel = require("../middleware/adminAccessLevel");
const verifyId = require("../middleware/verifyId");
const limitAuth = require("../middleware/limitAuth");
const { v4: uuidv4 } = require("uuid");
const ForgetPass = require("../model/ForgetPass");
const Activate = require("../model/Activate");

// List of all users
router.get("/", verify, adminAccessLevel, async (req, res) => {
  const data = await User.find().sort({
    createdAt: "desc",
  });

  const users = [];

  for (let i = 0; i < data.length; i++) {
    users[i] = {
      _id: data[i]._id,
      name: data[i].name,
      email: data[i].email,
      permissionLevel: data[i].permissionLevel,
      active: data[i].active,
      createdAt: data[i].createdAt,
    };
  }

  res.status(200).json(users);
});

// Logout User using Session
router.get("/logout", verify, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.clearCookie(process.env.SESSION_AUTH_NAME);
    res.status(200).json({ success: true, result: "Session Removed" });
  });
});

// Request for Reseting Password (Forget Password)
router.post("/forget", async (req, res) => {
  // Validation
  const { error } = emailValidation(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, result: error.details[0].message });

  const email = req.body.email.toLowerCase().toString();

  // Checks if the User Exists
  const user = await User.findOne({ email: email });
  if (!user)
    return res.status(400).json({ success: false, result: "invalid email" });

  // Check if there is another Request of Reseting Pass for this email ...
  // if there is Delete that!
  await ForgetPass.findOneAndRemove({
    email: email,
  }).catch((err) => {
    return console.log(err);
  });

  // Getting Current Time
  const date = new Date().getTime();

  // Creating the Request
  const requestPwd = new ForgetPass({
    email: req.body.email.toLowerCase(),
    uuid: uuidv4(),
    expiresAt: date + 1000 * 60 * 60,
    createdAt: date,
  });

  try {
    await requestPwd.save();
    res.status(201).json({ success: true, result: "Check Your Email ..." });
  } catch (error) {
    res.status(400).json({ success: false, result: error });
  }
});

// Request for Creating a New Password with valid UUID
router.post("/reset", async (req, res) => {
  // Checks if email and UUID is Assigned
  if (
    !req.body.email ||
    !req.body.uuid ||
    !req.body.password ||
    !req.body.repassword
  )
    return res.status(400).send("no email or uuid");

  const email = req.body.email.toLowerCase().toString();
  const uuid = req.body.uuid.toLowerCase().toString();
  const password = req.body.password.toLowerCase().toString();
  const repassword = req.body.repassword.toLowerCase().toString();

  // Checks if User Available
  const checkInUsers = await User.findOne({
    email: email,
  });
  if (!checkInUsers) return res.status(400).send("no email in USER");

  // Checks if User Requested to Reset Password
  const data = await ForgetPass.findOne({
    email: email,
  });

  if (!data) return res.status(400).send("there is no request with this email");

  // Checks if the Request was Used !!
  if (data.used === true) return res.status(400).send("it's used");

  if (!data || data.uuid !== uuid)
    return res.status(400).send("uuid is invalid");

  // Checks if the Request Expired via Time
  const now = new Date().getTime();
  if (now > data.expiresAt) return res.status(400).send("Linked Expired");

  if (password !== repassword)
    return res.status(400).send("passwords are not the same");

  // Generating a Hashed Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Making the Link of UUID to used ...
  await ForgetPass.updateOne({ email: email }, { $set: { used: true } });

  // Updating the User Password
  await User.updateOne(
    { email: req.body.email.toLowerCase() },
    { $set: { password: hashedPassword, updatedAt: new Date().toString() } }
  )
    .then((result) => {
      res.json({ success: true, result: result });
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
});

// Admin Request for Assigning a new Passport for a User
router.post("/a-reset", verify, adminAccessLevel, async (req, res) => {
  // Checks if email and password is Assigned
  if (!req.body._id || !req.body.password)
    return res.status(400).send("no _id or password");

  const _id = req.body._id.toLowerCase().toString();
  const password = req.body.password.toLowerCase().toString();

  // Checks if User Available
  const checkInUsers = await User.findById(_id);
  if (!checkInUsers) return res.status(400).send("no _id in DB");

  // Generating a Hashed Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Updating the User Password
  await User.updateOne(
    { _id: _id },
    { $set: { password: hashedPassword, updatedAt: new Date().toString() } }
  )
    .then((result) => {
      res.json({ success: true, result: result });
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
});

// Delete a User
router.delete("/:id", verify, adminAccessLevel, async (req, res) => {
  try {
    const data = await User.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ success: true, result: data });
  } catch (error) {
    res.status(400).json({ success: false, error: 400 });
  }
});

// Editing a User Route
router.put("/edit/:id", verify, verifyId, async (req, res) => {
  await User.updateOne(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name.toString(),
        updatedAt: new Date().toString(),
      },
    }
  )
    .then((result) => {
      res.json({ success: true, result: result });
    })
    .catch((err) => {
      res.json({ success: false, error: err });
    });
});

// Send Request for Activing User
router.post("/req-active", limitAuth, async (req, res) => {
  // Validation
  const { error } = emailValidation(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, result: error.details[0].message });

  const email = req.body.email.toLowerCase().toString();

  // Checks if the User Exists
  const user = await User.findOne({ email: email });
  if (!user)
    return res.status(400).json({ success: false, result: "invalid email" });

  // Checks if the User is Active
  if (user.active === true)
    return res
      .status(400)
      .json({ success: false, result: "the user is active" });

  // Check if there is another Request of Activing Pass for this email ...
  // if there is Delete that!
  await Activate.findOneAndRemove({
    email: email,
  }).catch((err) => {
    return console.log(err);
  });

  // Getting Current Time
  const date = new Date().getTime();

  // Creating the Request
  const requestActivate = new Activate({
    email: req.body.email.toLowerCase(),
    uuid: uuidv4(),
    expiresAt: date + 1000 * 60 * 60,
    createdAt: date,
  });

  try {
    await requestActivate.save();
    res.status(201).json({ success: true, result: "Check Your Email ..." });
  } catch (error) {
    res.status(400).json({ success: false, result: error });
  }
});

// Making User Active By User itself (using email, UUID)
router.post("/activate", limitAuth, async (req, res) => {
  // Validation
  const { error } = activateValidation(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, result: error.details[0].message });

  const email = req.body.email.toLowerCase().toString();
  const uuid = req.body.uuid.toString();

  // Checks if User Available
  const checkInUsers = await User.findOne({
    email: email,
  });
  if (!checkInUsers) return res.status(400).send("email not found");

  // Checks if User Requested to Active
  const data = await Activate.findOne({
    email: email,
  });
  if (!data) return res.status(400).send("there is no request with this email");

  // Checks if the Request was Used !!
  if (data.used === true) return res.status(400).send("Link is Used");

  if (!data || data.uuid !== uuid)
    return res.status(400).send("uuid is invalid");

  // Checks if the Request Expired via Time
  const now = new Date().getTime();
  if (now > data.expiresAt) return res.status(400).send("Linked Expired");

  // Making the Link of UUID to used ...
  await Activate.updateOne({ email: email }, { $set: { used: true } });

  // Updating the User Activation Status
  await User.updateOne(
    { email: email },
    { $set: { active: true, updatedAt: new Date().toString() } }
  )
    .then((result) => {
      res.json({ success: true, result: result });
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
});

// Admin Request for Activing a User
router.post("/a-activate", verify, adminAccessLevel, async (req, res) => {
  // Checks if _id is Assigned
  if (!req.body._id) return res.status(400).send("no _id");

  const _id = req.body._id.toLowerCase().toString();

  // Checks if User Available
  const checkInUsers = await User.findById(_id);
  if (!checkInUsers) return res.status(400).send("no _id in DB");

  // Updating the User
  await User.updateOne(
    { _id: _id },
    { $set: { active: true, updatedAt: new Date().toString() } }
  )
    .then((result) => {
      res.json({ success: true, result: result });
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
});

// Single user Data
router.get("/:id", verify, verifyId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      success: true,
      result: {
        _id: user.id,
        name: user.name,
        email: user.email,
        permissionLevel: user.permissionLevel,
        active: user.active,
        createdAt: Date.parse(user.createdAt),
      },
    });
  } catch (err) {
    res.status(404).json({ success: false, error: 404 });
  }
});

// Registeration
router.post("/register", limitAuth, async (req, res) => {
  // Validation
  const { error } = registerValidation(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, result: error.details[0].message });

  const email = req.body.email.toLowerCase().toString();
  const password = req.body.password.toString();
  const repeat_password = req.body.repeat_password.toString();

  // Checks if Email dose not Exists
  const emailExist = await User.findOne({ email: email });
  if (emailExist)
    return res
      .status(400)
      .json({ success: false, result: "email already exist" });

  // Checking if the Passwords are the same
  if (password !== repeat_password)
    return res.status(400).send("passwords are not the same");

  // Creating a Hashed Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Creating the User
  const user = new User({
    email: email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res
      .status(201)
      .json({ success: true, user_id: savedUser._id, active: false });
  } catch (error) {
    res.status(400).json({ success: false, result: error });
  }
});

// Sign in
router.post("/login", limitAuth, async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, result: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return res.status(400).json({ success: false, result: "invalid email" });

  const checkPass = await bcrypt.compare(req.body.password, user.password);
  if (!checkPass)
    return res.status(400).json({ success: false, result: "wrong password" });

  if (user.active === false)
    return res
      .status(400)
      .json({ success: false, result: "you are not actived" });

  // Create and assign a JWT token
  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_TOKEN_SECRET,
    { expiresIn: "1h" },
    { algorithm: "HS256" }
  );

  req.session.authorization = token;

  res.status(200).json({
    success: true,
    user_id: user._id,
    permissionLevel: user.permissionLevel,
    active: user.active,
  });
});

module.exports = router;
