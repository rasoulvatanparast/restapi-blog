const express = require("express");
const router = express.Router();
const Contact = require("../model/Contact");
const { contactValidation } = require("../config/validation");
const verify = require("../middleware/verifyToken");
const adminAccessLevel = require("../middleware/adminAccessLevel");

// Contact CRUD Operations
// Read
router.get("/", verify, adminAccessLevel, async (req, res) => {
  const contact = await Contact.find().sort({
    createdAt: "desc",
  });
  res.status(200).json(contact);
});

// Read One
router.get("/:id", verify, adminAccessLevel, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
      // Making the read to TRUE
      await Contact.updateOne({ _id: req.params.id }, { $set: { read: true } });

      res.status(200).json({
        success: true,
        contact,
      });
    } else {
      res.status(404).json({ success: false, error: 404 });
    }
  } catch (err) {
    res.status(404).json({ success: false, error: 404 });
  }
});

// Create
router.post("/", async (req, res) => {
  const { error } = contactValidation(req.body);
  if (error) return res.status(400).json({ success: false, result: error });

  const title = req.body.title || "Untitled";
  const body = req.body.body || "Content goes here!";
  const name = req.body.name;
  const email = req.body.email;

  const contact = new Contact({
    title: title,
    body: body,
    name: name,
    email: email,
  });

  try {
    const result = await contact.save();
    res.status(201).json({ success: true, result: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete
router.delete("/:id", verify, adminAccessLevel, async (req, res) => {
  try {
    const contact = await Contact.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ success: true, result: contact });
  } catch (error) {
    res.status(400).json({ success: false, error: 400 });
  }
});

module.exports = router;
