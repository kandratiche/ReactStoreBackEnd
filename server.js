import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

dotenv.config();
const mongo_uri = process.env.MONGO_URI;

const app = express();
const PORT = process.env.PORT || 5000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const Item = mongoose.model('Item', {
  name: String,
  image: String,
  description: String,
  price: Number,
});

const User = mongoose.model('User', {
  username: String,
  firstName: String,
  password: String,
  gender: String,
  email: String,
  phone: Number
})

app.post('/register', async (req, res) => {
  const {username, firstName, password, gender, email, phone} = req.body;
  if(!username || !password || !email){
    return res.status(400).json({message: 'Missing Required Data'})
  }

  const newUser = new User({username, firstName, password, gender, email, phone});
  await newUser.save();
  res.status(201).send(newUser);
})

app.get('/register', async (req, res) => {
  const users = await User.find();
  res.send(users);
})

app.post('/items', upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const newItem = new Item({ name, image, description, price });
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
