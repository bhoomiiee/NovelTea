const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Try models in order — stop at the first one that succeeds
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

// Static fallback — used when Gemini is unavailable
const STATIC = {
  Happy:      [
    { title: "The Hitchhiker's Guide to the Galaxy", author: 'Douglas Adams',              genre: 'Sci-Fi Comedy',    why: 'Absurd, warm humour perfectly matches a cheerful mood.' },
    { title: 'Good Omens',                           author: 'Terry Pratchett & Neil Gaiman', genre: 'Fantasy Comedy', why: 'Witty and joyful — ideal when you\'re feeling great.' },
    { title: 'The Rosie Project',                    author: 'Graeme Simsion',              genre: 'Romantic Comedy',  why: 'Endearingly funny and heartwarming.' },
  ],
  Motivated:  [
    { title: 'Atomic Habits',     author: 'James Clear',    genre: 'Self-Help', why: 'Build systems that sustain your ambition long-term.' },
    { title: "Can't Hurt Me",     author: 'David Goggins',  genre: 'Memoir',    why: 'Raw, unfiltered drive from the hardest man alive.' },
    { title: 'The 10X Rule',      author: 'Grant Cardone',  genre: 'Business',  why: 'Pushes you to think and act at a higher level.' },
  ],
  Lonely:     [
    { title: 'Eleanor Oliphant Is Completely Fine', author: 'Gail Honeyman',              genre: 'Fiction',   why: 'A deeply human story about connection and healing.' },
    { title: 'The Little Prince',                   author: 'Antoine de Saint-Exupéry',   genre: 'Classic',   why: 'Tender and profound — you\'re never truly alone.' },
    { title: 'A Man Called Ove',                    author: 'Fredrik Backman',             genre: 'Fiction',   why: 'Quietly beautiful story about unexpected friendship.' },
  ],
  Curious:    [
    { title: 'Sapiens',                author: 'Yuval Noah Harari', genre: 'History',  why: 'Sweeping story of humankind to fuel your curiosity.' },
    { title: 'A Brief History of Time', author: 'Stephen Hawking',  genre: 'Science',  why: 'Marvel at the universe and our place in it.' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',  genre: 'Psychology', why: 'Fascinating deep dive into how the mind works.' },
  ],
  Productive: [
    { title: 'Deep Work',            author: 'Cal Newport',     genre: 'Productivity', why: 'Master distraction-free focus for meaningful output.' },
    { title: 'The 4-Hour Work Week', author: 'Timothy Ferriss', genre: 'Business',     why: 'Redesign your life around what matters most.' },
    { title: 'Getting Things Done',  author: 'David Allen',     genre: 'Productivity', why: 'The definitive system for stress-free productivity.' },
  ],
  Relaxed:    [
    { title: 'The Midnight Library', author: 'Matt Haig',    genre: 'Fiction',  why: 'A gentle, cosy read perfect for unwinding.' },
    { title: 'Stardust',             author: 'Neil Gaiman',  genre: 'Fantasy',  why: 'Magical and dreamy — ideal for a relaxed evening.' },
    { title: 'Winnie-the-Pooh',      author: 'A.A. Milne',   genre: 'Classic',  why: 'Simple, warm wisdom for a peaceful mind.' },
  ],
  Frustrated: [
    { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',   genre: 'Self-Help',  why: 'Blunt, refreshing perspective to reset your mindset.' },
    { title: "Man's Search for Meaning",            author: 'Viktor Frankl', genre: 'Philosophy', why: 'Find purpose and strength beyond frustration.' },
    { title: 'Meditations',                         author: 'Marcus Aurelius', genre: 'Philosophy', why: 'Stoic wisdom for keeping calm under pressure.' },
  ],
  Inspired:   [
    { title: 'Big Magic',       author: 'Elizabeth Gilbert', genre: 'Creativity', why: 'Embrace creative living beyond fear.' },
    { title: 'The Alchemist',   author: 'Paulo Coelho',      genre: 'Fiction',    why: 'Follow your personal legend — timeless inspiration.' },
    { title: 'Bird by Bird',    author: 'Anne Lamott',       genre: 'Writing',    why: 'Permission to create imperfectly and joyfully.' },
  ],
};

/**
 * Parse Gemini's JSON response safely.
 * Gemini sometimes wraps JSON in markdown code fences.
 */
const parseGeminiBooks = (text) => {
  // Strip markdown fences if present
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Find the JSON array
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array found');

  const arr = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('Empty array');

  // Validate shape — each item needs title, author, genre, why
  return arr.map((b) => ({
    title:  String(b.title  || b.Title  || '').trim(),
    author: String(b.author || b.Author || '').trim(),
    genre:  String(b.genre  || b.Genre  || 'General').trim(),
    why:    String(b.why    || b.reason || b.Why || '').trim(),
  })).filter((b) => b.title && b.author);
};

// @desc    Get mood-based book recommendations via Gemini AI
// @route   POST /api/mood/recommend
// @access  Private
exports.getMoodRecommendations = async (req, res) => {
  const { mood } = req.body;

  if (!mood) {
    return res.status(400).json({ message: 'Mood is required' });
  }

  // Try Gemini models in order until one works
  if (GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const STYLES = [
          'classic literature and timeless fiction',
          'modern bestsellers and contemporary fiction',
          'hidden gems and underrated books',
          'international and translated literature',
          'award-winning books from the last decade',
          'short and quick reads under 300 pages',
          'epic and immersive long reads',
          'books with strong female protagonists',
          'books that became popular on social media',
        ];
        const style = STYLES[Math.floor(Math.random() * STYLES.length)];
        const seed = Math.floor(Math.random() * 10000);

        const prompt = `You are a book recommendation expert. A reader is feeling "${mood}" right now.

Focus specifically on: ${style}. Seed: ${seed}.

Recommend exactly 4 DIFFERENT books that perfectly match this mood and style focus. 
Do NOT recommend Atomic Habits, The Alchemist, Sapiens, or any extremely common recommendations.
Pick fresh, varied, interesting books.

Return ONLY a valid JSON array with no extra text, no markdown, no explanation.
Each object must have exactly these keys: "title", "author", "genre", "why".
"why" = one sentence (max 12 words) on why this book suits a "${mood}" mood.

Return only the JSON array:`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 1.2,
              topP: 0.95,
              topK: 64,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          const code = errData?.error?.code;
          // 429 = quota exceeded — try next model; anything else = stop
          if (code === 429 || code === 503) {
            console.warn(`Model ${model} quota exceeded, trying next...`);
            continue;
          }
          throw new Error(`Gemini HTTP ${response.status}: ${errData?.error?.message}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error('Empty Gemini response');

        const books = parseGeminiBooks(rawText);

        console.log(`Mood recommendations served by ${model}`);
        return res.json({ books, source: 'gemini', model });

      } catch (err) {
        console.error(`Model ${model} failed:`, err.message);
        // Continue to next model
      }
    }
    console.warn('All Gemini models exhausted, using static fallback');
  }

  // Static fallback
  const fallback = STATIC[mood];
  if (fallback) {
    return res.json({ books: fallback, source: 'static' });
  }

  return res.status(400).json({ message: `Unknown mood: ${mood}` });
};
