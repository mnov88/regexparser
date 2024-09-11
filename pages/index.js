// File: pages/index.js
import { useState } from 'react';

// EULawParser utility
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
        currentChapter = { id: Math.random().toString(36).substr(2, 9), number: chapterMatch[1], title: chapterMatch[2], sections: [], articles: [] };
        document.chapters.push(currentChapter);
        currentSection = null;
        currentArticle = null;
      } else if (sectionMatch) {
        currentSection = { id: Math.random().toString(36).substr(2, 9), number: sectionMatch[1], title: sectionMatch[2], articles: [] };
        currentChapter.sections.push(currentSection);
        currentArticle = null;
      } else if (articleMatch) {
        currentArticle = { id: Math.random().toString(36).substr(2, 9), number: articleMatch[1], title: articleMatch[2], paragraphs: [] };
        if (currentSection) {
          currentSection.articles.push(currentArticle);
        } else if (currentChapter) {
          currentChapter.articles.push(currentArticle);
        } else {
          document.unassignedArticles.push(currentArticle);
        }
      } else if (paragraphMatch && currentArticle) {
        currentArticle.paragraphs.push({ id: Math.random().toString(36).substr(2, 9), number: paragraphMatch[1], content: paragraphMatch[2] });
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

// ArticleView component
function ArticleView({ article, onBack }) {
  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h2>Article {article.number}</h2>
      <h3>{article.title}</h3>
      {article.paragraphs.map((paragraph, index) => (
        <p key={index}>
          {paragraph.number && <span style={{ fontWeight: 'bold' }}>{paragraph.number} </span>}
          {paragraph.content}
        </p>
      ))}
    </div>
  );
}

// SectionView component
function SectionView({ section, onBack }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (selectedArticle) {
    return <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div>
      <button onClick={onBack}>Back to Chapter</button>
      <h2>Section {section.number}</h2>
      <ul>
        {section.articles.map((article) => (
          <li key={article.id}>
            <button onClick={() => setSelectedArticle(article)}>
              Article {article.number}: {article.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ChapterView component
function ChapterView({ chapter, onBack }) {
  const [selectedView, setSelectedView] = useState(null);

  if (selectedView) {
    return selectedView;
  }

  return (
    <div>
      <button onClick={onBack}>Back to Document</button>
      <h2>Chapter {chapter.number}</h2>
      <ul>
        {chapter.sections.map((section) => (
          <li key={section.id}>
            <button onClick={() => setSelectedView(<SectionView section={section} onBack={() => setSelectedView(null)} />)}>
              Section {section.number}: {section.title}
            </button>
          </li>
        ))}
        {chapter.articles.map((article) => (
          <li key={article.id}>
            <button onClick={() => setSelectedView(<ArticleView article={article} onBack={() => setSelectedView(null)} />)}>
              Article {article.number}: {article.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// UnassignedArticlesView component
function UnassignedArticlesView({ articles, onBack }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (selectedArticle) {
    return <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div>
      <button onClick={onBack}>Back to Document</button>
      <h2>Unassigned Articles</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <button onClick={() => setSelectedArticle(article)}>
              Article {article.number}: {article.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// EULawDocumentView component
function EULawDocumentView({ document }) {
  const [selectedView, setSelectedView] = useState(null);

  if (selectedView) {
    return selectedView;
  }

  return (
    <div>
      <h2>{document.title}</h2>
      <ul>
        {document.chapters.map((chapter) => (
          <li key={chapter.id}>
            <button onClick={() => setSelectedView(<ChapterView chapter={chapter} onBack={() => setSelectedView(null)} />)}>
              Chapter {chapter.number}: {chapter.title}
            </button>
          </li>
        ))}
        {document.unassignedArticles.length > 0 && (
          <li>
            <button onClick={() => setSelectedView(<UnassignedArticlesView articles={document.unassignedArticles} onBack={() => setSelectedView(null)} />)}>
              Unassigned Articles
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

// Main App component
export default function Home() {
  const [url, setUrl] = useState('');
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDocument(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const plainText = await response.text();
      const parser = new EULawParser();
      const parsedDocument = parser.parse(plainText);
      setDocument(parsedDocument);
    } catch (error) {
      console.error('Error parsing document:', error);
      setError('Failed to fetch or parse the document. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
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
          style={{ marginRight: '8px', padding: '8px', width: 'calc(100% - 120px)' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Parsing...' : 'Parse Document'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {document && <EULawDocumentView document={document} />}
    </div>
  );
}
