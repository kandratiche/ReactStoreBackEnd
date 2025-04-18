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

const users = [];

app.post('/register', async (req, res) => {
  console.log(req.body);
  const {username, firstName, password, gender, email, phone} = req.body;
  if(!username || !password || !email){
    alert('Missing required data');
    return res.status(400).json({message: 'Missing Required Data'})
  }

  const check = await User.findOne({username})
  if(check) { 
    alert('Username already taken') 
    return res.status(400).json({message: 'Username is taken'})
  }

  const newUser = new User({username, firstName, password, gender, email, phone});
  await newUser.save();
  res.status(201).send(newUser);
})

app.get('/register', async (req, res) => {
  const users = await User.find();
  res.send(users);
})

app.post('/login', async (req,res) => {
  const {username, password} = req.body;
  if(!username || !password) return res.status(400).json({message: 'Missing required data'});
  try {
    const user = await User.findOne({username});
    if(!user){
      alert('User not Found');
      return res.status(400).json({message: 'User not found'});
    }
    if(user.password !== password) return res.status(400).json({message: 'Password is incorrect'});
    res.status(200).json({message: 'Login successful', user: {username: user.username, password: user.password, email: user.email, firstName: user.firstName, phone: user.phone, gender: user.gender}});
  } catch (error) {
    console.error('Login error: ', error);
    res.status(500).json({message: 'Internal server error'})
  }
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
