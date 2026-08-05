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

// Merge additional profile fields onto an existing user doc
const updateUser = async (uid, updates) => {
  await db.collection("users").doc(uid).set(updates, { merge: true });

  const doc = await db.collection("users").doc(uid).get();
  return doc.data();
};

module.exports = {
  getUserByUID,
  createUser,
  updateUser,
};