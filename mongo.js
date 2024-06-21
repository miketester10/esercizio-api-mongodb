const { MongoClient } = require("mongodb");

let client;

connectToDb = async () => {
  const uri = process.env.URI_MONGODB;

  try {
    client = new MongoClient(uri);
    await client.connect();
  } catch (err) {
    throw err;
  }
};

getConnection = () => {
  if (!client) {
    throw new Error("La connessione a MongoDB non è stata stabilita.");
  }

  return client.db(); // Ritorna l'istanza del database
};

module.exports = { connectToDb, getConnection };
