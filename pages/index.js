// File: pages/index.js
import { useState } from 'react';

class EULawParser {
  constructor() {
    this.titlePattern = /^(Regulation|Directive|Decision|Recommendation|Opinion)\s+(\(EU\)\s+\d{4}\/\d+)\s+of\s+the\s+(.+)$/i;
    this.chapterPattern = /^Chapter\s+(\d+[a-z]?)\s*(.+?)$/i;
    this.sectionPattern = /^Section\s+(\d+)\s*(.+?)$/i;
    this.articlePattern = /^Article\s+(\d+[a-z]?)\s*(.+?)$/i;
    this.paragraphPattern = /^\s*(\d+\.)?\s*(.+)$/;
    this.subparagraphPattern = /^\s*([a-z]\))?\s*(.+)$/;
  }

  parse(plainText) {
    const lines = plainText.split('\n');
    let document = { title: '', chapters: [], unassignedArticles: [] };
    let currentChapter = null;
    let currentSection = null;
    let currentArticle = null;

    for (const line of lines) {
      const titleMatch = line.match(this.titlePattern);
      const chapterMatch = line.match(this.chapterPattern);
      const sectionMatch = line.match(this.sectionPattern);
      const articleMatch = line.match(this.articlePattern);
      const paragraphMatch = line.match(this.paragraphPattern);
      const subparagraphMatch = line.match(this.subparagraphPattern);

      if (titleMatch) {
        document.title = `${titleMatch[1]} ${titleMatch[2]} of the ${titleMatch[3]}`;
      } else if (chapterMatch) {
        currentChapter = { number: chapterMatch[1], title: chapterMatch[2], sections: [], articles: [] };
        document.chapters.push(currentChapter);
        currentSection = null;
        currentArticle = null;
      } else if (sectionMatch) {
        currentSection = { number: sectionMatch[1], title: sectionMatch[2], articles: [] };
        currentChapter.sections.push(currentSection);
        currentArticle = null;
      } else if (articleMatch) {
        currentArticle = { number: articleMatch[1], title: articleMatch[2], paragraphs: [] };
        if (currentSection) {
          currentSection.articles.push(currentArticle);
        } else if (currentChapter) {
          currentChapter.articles.push(currentArticle);
        } else {
          document.unassignedArticles.push(currentArticle);
        }
      } else if (paragraphMatch && currentArticle) {
        currentArticle.paragraphs.push({ number: paragraphMatch[1], content: paragraphMatch[2] });
      } else if (subparagraphMatch && currentArticle) {
        const lastParagraph = currentArticle.paragraphs[currentArticle.paragraphs.length - 1];
        if (lastParagraph) {
          lastParagraph.content += '\n' + (subparagraphMatch[1] || '') + subparagraphMatch[2];
        }
      }
    }

    return document;
  }
}

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
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const plainText = await response.text();
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
