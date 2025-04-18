const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
import dotenv from 'dotenv';
dotenv.config();
const mongo_uri = process.env.MONGO_URI

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const Item = mongoose.model('Item', {
  name: String,
  description: String,
  price: Number,
});

app.post('/items', async (req, res) => {
  const { name, description, price } = req.body;
  const newItem = new Item({ name, description, price });
  await newItem.save();
  res.status(201).send(newItem);
});

app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.send(items);
});

app.listen(PORT, () => {
  console.log(`Server running on https://reactstorebackend.onrender.com:${PORT}`);
});
