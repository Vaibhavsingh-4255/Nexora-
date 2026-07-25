const {
  getUserByUID,
} = require("../services/userService");

exports.checkUser = async (req, res) => {
  try {
    const { uid } = req.body;

    const user = await getUserByUID(uid);

    if (!user) {
      return res.json({
        exists: false,
      });
    }

    return res.json({
      exists: true,
      user,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};