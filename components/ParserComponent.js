import { useState } from 'react';

export default function ParserComponent() {
  const [url, setUrl] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setArticles(data.articles);
    } catch (error) {
      console.error('Error parsing document:', error);
    }
    setLoading(false);
  };

  return (
    <>
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
    </>
  );
}
