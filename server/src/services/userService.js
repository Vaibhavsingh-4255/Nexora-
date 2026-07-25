const { db } = require("../config/firebase");

const usersCollection = db.collection("users");

async function getUserByUID(uid) {
  const doc = await usersCollection.doc(uid).get();

  if (!doc.exists) return null;

  return doc.data();
}

async function getUserByUsername(username) {
  const snapshot = await usersCollection
    .where("username", "==", username)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return snapshot.docs[0].data();
}

async function createUser(user) {
  await usersCollection.doc(user.uid).set(user);
}

module.exports = {
  getUserByUID,
  getUserByUsername,
  createUser,
};