const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { connectToDb, getConnection } = require("./mongo");
require("dotenv").config();

let db;

/*** Inizializzo Express ***/
const app = express();
const PORT = process.env.PORT || 3000;

/*** Set-up Cors e express.json ***/
app.use(cors());
app.use(express.json());

/*** API's ***/

// Ottieni tutti i movies
app.get("/api/v1/movies", async (req, res) => {
  try {
    const result = await db
      .collection("movies")
      // .find({}, { projection: { _id: 0, title: 1 } })
      .find()
      .toArray();
    // console.log(result);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, data: err });
  }
});

// Ottieni un singolo movie per "id"
app.get("/api/v1/movies/:id", async (req, res) => {
  try {
    const objID = new ObjectId(req.params.id);
    // console.log(objID);
    const result = await db.collection("movies").findOne({ _id: objID });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, data: err });
  }
});

// Ottieni movies per "director"
app.get("/api/v1/movies/director/:director", async (req, res) => {
  try {
    const director = req.params.director;
    const regex = new RegExp(`\\b${director}\\b`, "i");
    // console.log(regex);
    const result = await db
      .collection("movies")
      .find({ director: { $regex: regex } })
      .toArray();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, data: err });
  }
});

// Ottieni movies per "actor"
app.get("/api/v1/movies/actor/:actor", async (req, res) => {
  try {
    const actor = req.params.actor;
    const regex = new RegExp(`\\b${actor}\\b`, "i");
    // console.log(regex);
    const result = await db
      .collection("movies")
      .find({ cast: { $regex: regex } })
      .toArray();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, data: err });
  }
});

/*** Connessione a MongoDB ed Avvio del server ***/
connectToDb()
  .then(() => {
    console.log("Connessione a MongoDB (in locale) avvenuta con successo!");

    /*** Ottengo connessione a MongoDB ***/
    db = getConnection();

    /*** Avvio del server ***/
    app.listen(PORT, () => {
      console.log(`Il server è in ascolto sulla porta ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Errore durante la connessione a MongoDB:", err);
  });
