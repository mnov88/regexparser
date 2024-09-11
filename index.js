// File: pages/index.js
import { useState } from 'react';
import { Input, Button, List } from '@/components/ui';

export default function Home() {
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">EU Law Document Parser</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter document URL"
          required
          className="mr-2"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Parsing...' : 'Parse Document'}
        </Button>
      </form>
      {articles.length > 0 && (
        <List>
          {articles.map((article) => (
            <List.Item key={article.id}>
              Article {article.number}: {article.title}
            </List.Item>
          ))}
        </List>
      )}
    </div>
  );
}
