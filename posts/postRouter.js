const express = require("express");
const Post = require("./postDb");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const posts = await Post.get(req.query);
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving data"
    });
  }
});

router.get("/:id", validatePostId, (req, res) => {
  res.status(200).json(req.post);
});

router.delete("/:id", validatePostId, async (req, res) => {
  try {
    const { id } = req.post;
    await Post.remove(id);
    res.status(200).json({ message: "post removed" });
  } catch (error) {
    res.status(500).json({ message: "could not process request" });
  }
});

router.put("/:id", validatePostId, async (req, res) => {
  try {
    const { id } = req.params;

    const changes = req.body;

    if (changes) {
      await Post.update(id, changes);
      res.status(200).json({ message: "post updated" });
    } else {
      res.status(400).json({ message: "please enter text into field" });
    }
  } catch (error) {
    res.status(500).json({ message: "could not process request" });
  }
});

// custom middleware

async function validatePostId(req, res, next) {
  try {
    const { id } = req.params;
    const post = await Post.getById(id);
    if (post) {
      req.post = post;
      next();
    } else {
      res.status(404).json({ message: "post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "failed to process request" });
  }
}

module.exports = router;
