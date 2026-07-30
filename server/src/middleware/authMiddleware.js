const { admin } = require("../config/firebase");

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = await admin.auth().verifyIdToken(token);

        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
};

module.exports = verifyToken;