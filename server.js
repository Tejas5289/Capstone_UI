import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  // Simple echo response - replace with your AI logic
  const reply = `You said: ${message}`;
  
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
