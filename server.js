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

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Папка для хранения изображений
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
  }
});

const upload = multer({ storage });

// Подключаем CORS и JSON
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Отдача статических файлов (картинок)

// Соединение с MongoDB
mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Модель товара
const Item = mongoose.model('Item', {
  name: String,
  image: String, // Здесь будем хранить путь к изображению
  description: String,
  price: Number,
});

// Эндпоинт для добавления товара
app.post('/items', upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : ''; // Путь к загруженному изображению

  const newItem = new Item({ name, image, description, price });
  await newItem.save();
  res.status(201).send(newItem);
});

// Эндпоинт для получения всех товаров
app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.send(items);
});

app.listen(PORT, () => {
  console.log(`Server running on https://reactstorebackend.onrender.com:${PORT}`);
});
