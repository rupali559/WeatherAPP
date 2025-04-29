const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// const MONGO_URI = 'mongodb://35.225.114.159:27017/login-app';

// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.log('❌ MongoDB connection error:', err));

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password: hashed });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'User exists or DB error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Wrong password' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));

