const { getAuth } = require("firebase-admin/auth");
const {
  getUserByUID,
  createUser,
  updateUser,
} = require("../services/userService");

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "ID Token is required",
      });
    }

    // Verify the Firebase ID Token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const uid = decodedToken.uid;

    let user = await getUserByUID(uid);

    // First-time login
    if (!user) {
      user = {
        uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        username: null, // User will choose later
        bio: "",
        createdAt: new Date().toISOString(),
      };

      await createUser(user);
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Invalid Firebase Token",
    });
  }
};

// One-time "complete your profile" step after a first Google sign-in:
// username, password, name, gender, birthday, favorite genre, badge.
const completeProfile = async (req, res) => {
  try {
    const { uid, username, password, name, gender, birthday, genre, badge } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: "uid is required" });
    }
    if (!username || !/^\d{8}$/.test(password || "")) {
      return res.status(400).json({
        success: false,
        message: "username is required and password must be exactly 8 digits",
      });
    }

    const user = await getUserByUID(uid);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updated = await updateUser(uid, {
      username,
      password, // demo only — a real app must hash this before storing it
      name,
      gender: gender || "",
      birthday: birthday || "",
      favoriteGenre: genre || "",
      badge: badge || "",
    });

    return res.status(200).json({ success: true, user: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Could not complete profile" });
  }
};

module.exports = {
  googleLogin,
  completeProfile,
};