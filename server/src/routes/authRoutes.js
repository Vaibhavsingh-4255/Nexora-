const express = require("express");

const router = express.Router();

const {
  checkUser,
} = require("../controllers/authController");

router.post("/check-user", checkUser);

module.exports = router;