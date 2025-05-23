const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9rzwgbq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Get the collection from the 'greencircle' database
    const slidesCollection = client
      .db("greencircle")
      .collection("slides");
    const gardenersCollection = client
      .db("greencircle")
      .collection("gardeners");
    const gardenTipsCollection = client
      .db("greencircle")
      .collection("gardenTips");
    const userCollection = client.db("greencircle").collection("users");

    app.get("/slides", async (req, res) => {
      const slides = await slidesCollection.find().toArray();
      res.send(slides);
    })

    app.get("/gardeners", async (req, res) => {
      const activeGardeners = await gardenersCollection
        .find({ status: "Active" })
        .limit(6)
        .toArray();
      res.send(activeGardeners);
    });

    app.post("/gardenTips", async (req, res) => {
      const gardenTip = req.body;
      const result = await gardenTipsCollection.insertOne(gardenTip);
      res.send(result);
    });

    app.get("/gardenTips", async (req, res) => {
      const gardenTips = await gardenTipsCollection.find().toArray();
      res.send(gardenTips);
    });

    app.get("/gardenTips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gardenTipsCollection.findOne(query);
      res.send(result);
    });

    app.get("gardenTips", async (req, res) => {
      const email = req.query.email;
      const query = email ? { userEmail: email } : {};
      const result = await gardenTipsCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/gardenTips/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedGardenTip = req.body;
      const updatedDoc = {
        $set: updatedGardenTip,
      };

      const result = await gardenTipsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/gardenTips/:id", async (req,res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gardenTipsCollection.deleteOne(query);
      res.send(result);
    })

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
      const result = await userCollection.insertOne(userProfile);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`GreenCircle server is running on port ${port}`);
});
