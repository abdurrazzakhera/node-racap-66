const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//mibleware for backend
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello I am from backend");
});

// Mongo DB connect

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6optc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("geniusCar").collection("carServices");
    // console.log("db connect aassssssssss");
    //Multiple user call form database;
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const resutl = await cursor.toArray();
      res.send(resutl);
    });

    // single user call from database
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const servicesresult = await serviceCollection.findOne(query);
      res.send(servicesresult);
    });

    //Post a New Service
    app.post("/service", async (req, res) => {
      const newUser = req.body;
      const addService = await serviceCollection.insertOne(newUser);
      res.send(addService);
    });

    // post delete Api
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Nothing Write here
  }
}
run().catch(console.dir);
// at lasst lisent the app
app.listen(port, () => {
  console.log("the server runnging succefull this port", port);
});
