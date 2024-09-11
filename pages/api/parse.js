import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      const response = await axios.get(url);
      const plainText = response.data;
      const articles = parseDocument(plainText);
      res.status(200).json({ articles });
    } catch (error) {
      res.status(500).json({ error: 'Error parsing document' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function parseDocument(plainText) {
  const articlePattern = /^Article\s+(\d+[a-z]?)\s*(.+?)$/gm;
  const articles = [];
  let match;

  while ((match = articlePattern.exec(plainText)) !== null) {
    articles.push({
      id: Math.random().toString(36).substr(2, 9),
      number: match[1],
      title: match[2],
    });
  }

  return articles;
}
