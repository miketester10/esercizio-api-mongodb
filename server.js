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
    console.log(err.message);
    res.status(500).json({ success: false, data: err.message });
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
    console.log(err.message);
    res.status(500).json({ success: false, data: err.message });
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
    console.log(err.message);
    res.status(500).json({ success: false, data: err.message });
  }
});

// Ottieni movies per "oscar"
app.get("/api/v1/movies/oscar/:oscar", async (req, res) => {
  try {
    let gotOscar = req.params.oscar;
    switch (gotOscar) {
      case "true":
        gotOscar = true;
        break;
      case "false":
        gotOscar = false;
        break;
      case "null":
        gotOscar = null;
        break;
      default:
        gotOscar = null;
        break;
    }
    // console.log(gotOscar);
    const result = await db
      .collection("movies")
      .find({ gotOscar: gotOscar })
      .toArray();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, data: err.message });
  }
});

// Aggiungi un nuovo movie
app.post("/api/v1/movies", async (req, res) => {
  try {
    const movie = req.body;
    // console.log(movie);
    const result = await db.collection("movies").insertOne(movie);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, data: err.message });
  }
});

// Aggiorna un movie
app.put("/api/v1/movies/:id", async (req, res) => {
  try {
    const objID = new ObjectId(req.params.id);
    // ricevo json come array di oggetti i quali contengono i campi da aggiornare oppure da eliminare
    // update con valore booleano che indica di fare $set o $unset
    // esempio:
    // [
    //  {
    //   "title": "Titanic",
    //   "update": true
    //  },
    //  {
    //   "rating": "",
    //   "update": false
    //  }
    // ]

    const updatingFields = {};
    const deletingFields = {};

    const bodyJson = req.body;
    console.log(bodyJson);
    bodyJson.forEach((elemento) => {
      if (elemento.update) {
        console.log(`${Object.keys(elemento)[0]} è da aggiornare`);
        updatingFields[Object.keys(elemento)[0]] = Object.values(elemento)[0];
      } else {
        console.log(`${Object.keys(elemento)[0]} è da rimuovere`);
        deletingFields[Object.keys(elemento)[0]] = Object.values(elemento)[0];
      }
    });
    console.log(updatingFields);
    console.log(deletingFields);

    const result = await db
      .collection("movies")
      .updateOne(
        { _id: objID },
        { $set: updatingFields, $unset: deletingFields }
      );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, data: err.message });
  }
});

// Elimina un movie
app.delete("/api/v1/movies/:id", async (req, res) => {
  try {
    const objID = new ObjectId(req.params.id);
    // console.log(objID);
    const result = await db.collection("movies").deleteOne({ _id: objID });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, data: err.message });
  }
});

/*** Connessione a MongoDB ed Avvio del server ***/
connectToDb()
  .then(() => {
    console.log("Connessione a MongoDB (in locale) avvenuta con successo!");

    /*** Ottengo connessione da MongoDB ***/
    db = getConnection();

    /*** Avvio del server ***/
    app.listen(PORT, () => {
      console.log(`Il server è in ascolto sulla porta ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Errore durante la connessione a MongoDB:", err.message);
  });
