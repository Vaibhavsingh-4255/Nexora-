const { db } = require("./src/config/firebase");

async function test() {
  try {
    await db.collection("test").doc("hello").set({
      message: "Firebase Connected!",
      createdAt: new Date(),
    });

    console.log("✅ Firebase Connected Successfully");
  } catch (err) {
    console.error(err);
  }
}

test();