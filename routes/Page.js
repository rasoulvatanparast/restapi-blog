const express = require("express");
const router = express.Router();
const Page = require("../model/Page");
const { postInsertValiation } = require("../config/validation");
const verify = require("../middleware/verifyToken");
const adminAccessLevel = require("../middleware/adminAccessLevel");
const { slugify, finalizeSlug } = require("../config/slugify");

// Page CRUD Operations
// Read for the Normal Users
router.get("/", async (req, res) => {
  const data = await Page.find({ mode: "published" }).sort({
    createdAt: "desc",
  });
  res.status(200).json(data);
});

// Read all including Published and Draft for Admin
router.get("/all", verify, adminAccessLevel, async (req, res) => {
  const posts = await Page.find().sort({
    createdAt: "desc",
  });
  res.status(200).json(posts);
});

// Read One by ID for Admin
router.get("/read/:id", verify, adminAccessLevel, async (req, res) => {
  try {
    const result = await Page.findById(req.params.id);

    res.status(200).json({
      success: true,
      result: {
        _id: result.id,
        title: result.title,
        body: result.body,
        author: result.author,
        slug: result.slug,
        createdAt: Date.parse(result.createdAt),
        updatedAt: Date.parse(result.updatedAt),
      },
    });
  } catch (err) {
    res.status(404).json({ success: false, error: 404 });
  }
});

// Read One with Slug for Normal Users
router.get("/:slug", async (req, res) => {
  try {
    const page = await Page.find({ slug: req.params.slug, mode: "published" });

    const pageData = page[0];

    res.status(200).json({
      success: true,
      result: {
        _id: pageData._id,
        title: pageData.title,
        body: pageData.body,
        author: pageData.author,
        slug: pageData.slug,
        createdAt: Date.parse(pageData.createdAt),
        updatedAt: Date.parse(pageData.updatedAt),
      },
    });
  } catch (err) {
    res.status(404).json({ success: false, error: 404 });
  }
});

// Create
router.post("/", verify, adminAccessLevel, async (req, res) => {

  const { error } = postInsertValiation(req.body);
  if (error) return res.status(400).json({ success: false, result: error });

  const title = req.body.title || "Untitled Page";
  const body = req.body.body || "Content goes here!";
  const author = req.user._id;
  const slug = req.body.slug;
  const mode = req.body.mode;

  const data = new Page({
    title: title,
    body: body,
    author: author,
    slug: await finalizeSlug(Page, title, slug).catch((err) => {
      console.log(err);
    }),
    mode: mode,
  });

  try {
    const result = await data.save();
    res.status(201).json({ success: true, result: result });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// Delete
router.delete("/:id", verify, adminAccessLevel, async (req, res) => {
  try {
    const data = await Page.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ success: true, result: data.deletedCount });
  } catch (error) {
    res.status(400).json({ success: false, error: 400 });
  }
});

// Update One
router.put("/:id", verify, adminAccessLevel, async function (req, res) {
  const { error } = postInsertValiation(req.body);
  if (error) return res.status(400).json({ success: false, result: error });

  const title = req.body.title || "Untitled Post";
  const body = req.body.body || "Content goes here!";
  const author = req.user._id;
  var slug = req.body.slug;
  const mode = req.body.mode;

  slug = slugify(slug);

  const pageSlug = await Page.findById(req.params.id);
  if (slug !== pageSlug.slug) {
    slug = await finalizeSlug(Page, title, slug);
  }

  await Page.updateOne(
    { _id: req.params.id },
    {
      $set: {
        title: title,
        body: body,
        author: author,
        slug: slug,
        mode: mode,
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

module.exports = router;
