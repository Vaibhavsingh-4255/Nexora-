const { getAuth } = require("firebase-admin/auth");
const {
  getUserByUID,
  createUser,
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

module.exports = {
  googleLogin,
};