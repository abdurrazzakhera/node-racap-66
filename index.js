const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//mibleware for backend
app.use(cors());
app.use(express.json());

function varifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SCREAT, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
  console.log("inside jwt varify ", authHeader);
}

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
    const orderCollection = client.db("geniusCar").collection("order");
    // console.log("db connect aassssssssss");
    //auth user
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SCREAT, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
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

    //call the order
    app.get("/order", varifyJWT, async (req, res) => {
      const decodedEmail = req.decoded?.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const resutl = await cursor.toArray();
        res.send(resutl);
      }
    });

    //Post A New Order
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
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
