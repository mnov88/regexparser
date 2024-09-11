import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const plainText = await response.text();
      res.status(200).json({ plainText });
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Failed to fetch the document' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
