const express = require("express");
const User = require("./userDb.js");
const Post = require("../posts/postDb.js");

const router = express.Router();

router.post("/", validateUser, (req, res) => {
  res.status(201).json(req.body);
});

router.post("/:id/posts", validatePost, validateUserId, async (req, res) => {
  try {
    const id = req.params.id;
    const newPost = { ...req.body, user_id: id };
    await Post.insert(newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error processing request"
    });
  }
});

router.get("/", (req, res) => {
  User.get(req.query)
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Error retrieving data"
      });
    });
});

router.get("/:id", validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

router.get("/:id/posts", validateUserId, async (req, res) => {
  try {
    const userPosts = await User.getUserPosts(req.params.id);
    console.log(userPosts);
    res.status(200).json(userPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error processing request" });
  }
});

router.delete("/:id", validateUserId, async (req, res) => {
  try {
    const { id } = req.user;
    await User.remove(id);
    res.status(200).json({ message: "item removed" });
  } catch (error) {
    res.status(500).json({ message: "could not process request" });
  }
});

router.put("/:id", validateUserId, async (req, res) => {
  try {
    const { id } = req.params;

    const changes = req.body;

    if (changes) {
      await User.update(id, changes);
      res.status(200).json({ message: "username updated" });
    } else {
      res.status(400).json({ message: "please enter text into field" });
    }
  } catch (error) {
    res.status(500).json({ message: "could not process request" });
  }
});

//custom middleware

async function validateUserId(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.getById(id);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "failed to process request" });
  }
}

async function validateUser(req, res, next) {
  try {
    if (req.body.name.length > 0) {
      const newUser = await User.insert(req.body);
      res.status(201).json(newUser);
      console.log("validated");
      next();
    } else {
      res.status(400).json({
        errorMessage: "Please provide a username"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "error processing request"
    });
  }
}

async function validatePost(req, res, next) {
  try {
    if (req.body.text.length > 0) {
      console.log("validatedpost");
      next();
    } else {
      res.status(400).json({ errorMessage: "text field was blank" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error processing request" });
  }
}

module.exports = router;
