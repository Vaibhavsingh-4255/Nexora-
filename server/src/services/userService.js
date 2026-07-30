const { db } = require("../config/firebase");

// Find a user using Firebase UID
const getUserByUID = async (uid) => {
  const doc = await db.collection("users").doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

// Create a new user
const createUser = async (userData) => {
  await db.collection("users").doc(userData.uid).set(userData);

  return userData;
};

module.exports = {
  getUserByUID,
  createUser,
};