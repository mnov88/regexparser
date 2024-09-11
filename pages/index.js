import { useState } from 'react';
import { EULawParser } from '../utils/EULawParser';

export default function Home() {
  const [url, setUrl] = useState('');
  const [parsedDocument, setParsedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setParsedDocument(null);

    try {
      const response = await fetch('/api/fetchDocument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { plainText } = await response.json();
      const parser = new EULawParser();
      const document = parser.parse(plainText);
      setParsedDocument(document);
    } catch (error) {
      console.error('Error parsing document:', error);
      setError('Failed to fetch or parse the document. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHierarchy = (document) => {
    if (!document) return null;

    return (
      <pre>
        {document.title}
        {document.chapters.map((chapter, chapterIndex) => `
  Chapter ${chapter.number}: ${chapter.title}
    ${chapter.sections.map((section, sectionIndex) => `
    Section ${section.number}: ${section.title}
      ${section.articles.map((article, articleIndex) => `
      Article ${article.number}: ${article.title}`).join('')}`).join('')}
    ${chapter.articles.map((article, articleIndex) => `
    Article ${article.number}: ${article.title}`).join('')}`).join('')}
        ${document.unassignedArticles.map((article, articleIndex) => `
  Article ${article.number}: ${article.title}`).join('')}
      </pre>
    );
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>EU Law Document Parser</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter document URL"
          required
          style={{ width: '70%', padding: '5px', marginRight: '10px' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Parsing...' : 'Parse Document'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {parsedDocument && renderHierarchy(parsedDocument)}
    </div>
  );
}
