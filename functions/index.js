const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebase = require("firebase");
const app = require("express")();
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rex-cyber-solution.firebaseio.com",
});

const config = {
  apiKey: "AIzaSyC8ZoiUCy0bcrkcYpaEPvHv9HzQu5CByQI",
  authDomain: "rex-cyber-solution.firebaseapp.com",
  databaseURL: "https://rex-cyber-solution.firebaseio.com",
  projectId: "rex-cyber-solution",
  storageBucket: "rex-cyber-solution.appspot.com",
  messagingSenderId: "28150062468",
  appId: "1:28150062468:web:788aa290fff6fc23b0d1d1",
};

firebase.initializeApp(config);

const db = admin.firestore();

let token;

app.get("/users", (request, response) => {
  db.collection("users")
    .get()
    .then((data) => {
      let store = [];
      data.forEach((doc) => {
        store.push(doc.data());
      });
      return response.json(store);
    })
    .catch((err) => console.error(err));
});

app.post("/signup", (request, response) => {
  const userCredential = {
    email: request.body.email,
    password: request.body.password,
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(
      userCredential.email,
      userCredential.password
    )
    .then((data) => {
      token = data.user.getIdToken();
      return db.doc(`/users/${data.user.uid}`).set({
        email: userCredential.email,
      });
    })
    .then(() => {
      response
        .status(200)
        .json({ message: "User Registered Successfully", token: token });
    })
    .catch((err) => {
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ message: "User already exists" });
      }
    });
});

exports.api = functions.https.onRequest(app);
