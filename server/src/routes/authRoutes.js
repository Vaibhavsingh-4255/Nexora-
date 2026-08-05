const express = require("express");
const { googleLogin, completeProfile } = require("../controllers/authController");

const router = express.Router();

// Google Login Route
router.post("/google-login", googleLogin);

// One-time profile completion after a first-time Google sign-in
router.post("/complete-profile", completeProfile);

module.exports = router;