const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

app.use(express.static('public'));
app.use(bodyParser.json());

const GITHUB_API_URL = 'https://api.github.com';
const OWNER = 'your-github-username';
const REPO = 'your-repo-name';

app.post('/submit', async (req, res) => {
  const { name, message } = req.body;
  const timestamp = new Date().toISOString();
  const filename = `data/${Date.now()}-${name.replace(/\s+/g, '_')}.txt`;
  const content = `Name: ${name}\nMessage: ${message}\nDate: ${timestamp}`;

  const encodedContent = Buffer.from(content).toString('base64');

  try {
    const response = await fetch(`${GITHUB_API_URL}/repos/${OWNER}/${REPO}/contents/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'form-to-github-app'
      },
      body: JSON.stringify({
        message: `New submission from ${name}`,
        content: encodedContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);
      return res.status(500).send("Error saving to GitHub");
    }

    res.send('✅ Submission saved to GitHub!');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
