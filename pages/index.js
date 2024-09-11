import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(url);
      const plainText = await response.text();
      const parsedArticles = parseDocument(plainText);
      setArticles(parsedArticles);
    } catch (error) {
      console.error('Error parsing document:', error);
    }
    setLoading(false);
  };

  const parseDocument = (plainText) => {
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
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>EU Law Document Parser</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter document URL"
          required
          style={{ marginRight: '8px', padding: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Parsing...' : 'Parse Document'}
        </button>
      </form>
      {articles.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {articles.map((article) => (
            <li key={article.id} style={{ marginBottom: '8px' }}>
              Article {article.number}: {article.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
