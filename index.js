const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eru2v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("crafty").collection("product");
    const orderCollection = client.db("crafty").collection("order");
    const userCollection = client.db("crafty").collection("user");
    const reviewCollection = client.db("crafty").collection("review");
    const paymentCollection = client.db("crafty").collection("payments");

    //========== All Products API ==========
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //========== Product Delete API ==========
    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    //========== Single Product API ==========
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    //========== Purchase Product API ==========
    app.post("/order", async (req, res) => {
      const order = req.body.purchase;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    //========== Get User Filtering By Email ==========
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    
    //========== Get Users API ==========
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    //========== Make Admin API ==========
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    //========== Update User Profile ==========
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const profile = req.body;
      const query = { email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: profile.name,
          email: profile.email,
          education: profile.education,
          linkedIn: profile.linkedIn,
          location: profile.location,
          phone: profile.phone,
        },
      };
      const result = await userCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    //========== Admin Create ==========
    // app.put("/user/admin/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       name: profile.name,
    //       email: profile.email,
    //       education: profile.education,
    //       linkedIn: profile.linkedIn,
    //       location: profile.location,
    //       phone: profile.phone,
    //     },
    //   };
    //   const result = await userCollection.updateOne(query, updateDoc, options);
    //   res.send(result);
    // });

    //========== Post Review API ==========
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    //========== Get Review API ==========
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    //========== Get User Filtering By Email ==========
    app.get("/order", async (req, res) => {
      const result = await orderCollection.find().toArray();
      res.send(result);
    });

    //========== Product Delete API ==========
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(filter);
      res.send(result);
    });

    //========== Add Product API ==========
    app.post("/product", async (req, res) => {
      const product = req.body.addProduct;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });
    //========== User Delete API ==========
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    //============ Payment API ============
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.send(order);
    });

    //============ Payment Send ================
    app.post("/create-payment-intent", async (req, res) => {
      const service = req.body;
      const price = service.price;
      const amount = parseInt(price) * 100;
      if (amount) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
      }
    });

    //========== Payment Update ==========
    app.patch("/order/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };

      const result = await paymentCollection.insertOne(payment);
      const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
      res.send(updatedOrder);
    });
    //===============================================================================
  } finally {
    //    client.close();
  }
}
run().catch(console.dir);
//================================================================================
app.get("/", (req, res) => {
  res.send("Server Is Running....................");
});

app.listen(port, () => {
  console.log(
    "Server Is Running In The Command Line",
    port,
    "............................"
  );
});
