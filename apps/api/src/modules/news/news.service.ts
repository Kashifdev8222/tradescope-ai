// Mock news feed generator
const MOCK_SOURCES = ['Reuters', 'Bloomberg', 'CNBC'] as const;

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  published_at: string;
  related_symbols: string[];
}

const MOCK_TITLES = [
  'Fed Signals Potential Rate Cut in September Meeting',
  'Tech Stocks Rally as AI Optimism Continues to Grow',
  'Oil Prices Surge Amid Middle East Supply Concerns',
  'S&P 500 Hits New All-Time High on Strong Earnings',
  'Crypto Market Cap Surpasses $3 Trillion Milestone',
  'Bank of England Holds Interest Rates Steady at 5.25%',
  'Tesla Delivers Record Quarterly Vehicle Production',
  'Gold Prices Rise as Dollar Weakens Against Major Currencies',
  'Semiconductor Shortage Eases, Chip Stocks Rally',
  'European Markets Close Higher on Manufacturing Data',
  'Fed Chair Powell: Economy Moving in Right Direction',
  'Apple Unveils New AI Features at WWDC Conference',
  'US Job Market Adds More Jobs Than Expected in June',
  'China Stimulus Package Boosts Asian Markets',
  'Bitcoin ETFs See Record Inflows in Third Quarter',
];

const MOCK_SYMBOLS = [
  ['SPY', 'QQQ'],
  ['AAPL', 'MSFT', 'GOOGL', 'NVDA'],
  ['USO', 'XLE'],
  ['SPY'],
  ['BTC', 'ETH'],
  ['FXE', 'UUP'],
  ['TSLA'],
  ['GLD', 'UUP'],
  ['NVDA', 'AMD', 'INTC'],
  ['VGK'],
  ['SPY'],
  ['AAPL'],
  ['SPY'],
  ['FXI', 'BABA'],
  ['BTC', 'IBIT'],
];

let nextId = 1;

export async function getNewsFeed(source?: string, limit = 20): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];

  for (let i = 0; i < limit; i++) {
    const sourceIdx = i % MOCK_SOURCES.length;
    const titleIdx = i % MOCK_TITLES.length;

    if (source && MOCK_SOURCES[sourceIdx] !== source) continue;

    const publishedDate = new Date();
    publishedDate.setMinutes(publishedDate.getMinutes() - i * 30);

    articles.push({
      id: `news-${nextId++}`,
      title: MOCK_TITLES[titleIdx]!,
      source: MOCK_SOURCES[sourceIdx]!,
      summary: `Latest market update: ${MOCK_TITLES[titleIdx]!.toLowerCase()}. Analysts weigh in on potential market implications and sector outlook.`,
      url: '#',
      sentiment: i % 3 === 0 ? 'positive' : i % 3 === 1 ? 'neutral' : 'negative',
      published_at: publishedDate.toISOString(),
      related_symbols: MOCK_SYMBOLS[titleIdx] || [],
    });
  }

  return articles;
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  // For the mock, just generate a consistent article
  const idx = parseInt(id.replace('news-', '')) || 1;
  const titleIdx = idx % MOCK_TITLES.length;
  const sourceIdx = idx % MOCK_SOURCES.length;

  return {
    id,
    title: MOCK_TITLES[titleIdx]!,
    source: MOCK_SOURCES[sourceIdx]!,
    summary: `Full article: ${MOCK_TITLES[titleIdx]!.toLowerCase()}. Trading implications and expert analysis included.`,
    url: '#',
    sentiment: 'neutral',
    published_at: new Date().toISOString(),
    related_symbols: MOCK_SYMBOLS[titleIdx] || [],
  };
}
