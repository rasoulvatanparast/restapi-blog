const express = require("express");
const router = express.Router();
const Post = require("../model/Post");
const { postInsertValiation } = require("../config/validation");
const verify = require("../middleware/verifyToken");
const adminAccessLevel = require("../middleware/adminAccessLevel");
const { slugify, finalizeSlug } = require("../config/slugify");

// Post CRUD Operations
// Read for the Normal Users
router.get("/", async (req, res) => {
  const posts = await Post.find({ mode: "published" }).sort({
    createdAt: "desc",
  });
  res.status(200).json(posts);
});

// Read all including Published and Draft for Admin
router.get("/all", verify, adminAccessLevel, async (req, res) => {
  const posts = await Post.find().sort({
    createdAt: "desc",
  });
  res.status(200).json(posts);
});

// Read One by ID for Admin
router.get("/read/:id", verify, adminAccessLevel, async (req, res) => {
  try {
    const result = await Post.findById(req.params.id);

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
    const posts = await Post.find({ slug: req.params.slug, mode: "published" });

    const resultData = posts[0];

    res.status(200).json({
      success: true,
      result: {
        _id: resultData.id,
        title: resultData.title,
        body: resultData.body,
        author: resultData.author,
        slug: resultData.slug,
        createdAt: Date.parse(resultData.createdAt),
        updatedAt: Date.parse(resultData.updatedAt),
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

  const title = req.body.title || "Untitled Post";
  const body = req.body.body || "Content goes here!";
  const author = req.user._id;
  // const author = "rasoul";
  const slug = req.body.slug;
  const mode = req.body.mode;

  const post = new Post({
    title: title,
    body: body,
    author: author,
    slug: await finalizeSlug(Post, title, slug).catch((err) => {
      console.log(err);
    }),
    mode: mode,
  });

  try {
    const result = await post.save();
    res.status(201).json({ success: true, result: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete
router.delete("/:id", verify, adminAccessLevel, async (req, res) => {
  try {
    const data = await Post.deleteOne({
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
  // const author = req.user._id;
  const author = req.body.author;
  var slug = req.body.slug;
  const mode = req.body.mode;

  slug = slugify(slug);

  const postSlug = await Post.findById(req.params.id);
  if (slug !== postSlug.slug) {
    slug = await finalizeSlug(Post, title, slug);
  }

  await Post.updateOne(
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
