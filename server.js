const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: ['https://pixelstack-hub.vercel.app', 'http://localhost:4200']
}));

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt: ${email}`);
  
  res.json({
    success: true,
    user: { name: 'Tejas Sagar', username: 'Tejas03', email: email }
  });
});

app.listen(PORT, () => {
  console.log(`----------------------------------`);
  console.log(`PIXELSTACK BACKEND :: PORT ${PORT}`);
  console.log(`----------------------------------`);
});