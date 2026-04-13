/**
 * Chatbot Controller
 * Handles AI chatbot interactions with Gemini API
 * Falls back to mock responses if API key is not configured
 * Includes rate limit (429) error handling
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Mock responses for when API key is not available
 */
const MOCK_RESPONSES = {
  campus: {
    keywords: ['university', 'campus', 'location', 'albany', 'ualbany'],
    response:
      'University at Albany is located in Albany, NY. We have beautiful dining facilities, research labs, and modern student housing. The campus spans over 600 acres! Learn more: https://www.albany.edu',
  },
  majors: {
    keywords: [
      'major',
      'program',
      'degree',
      'study',
      'engineering',
      'business',
      'liberal arts',
    ],
    response:
      'UAlbany offers programs in Engineering, Business Administration, Liberal Arts, Sciences, and more! Each program has dedicated faculty and excellent career services. Explore our programs: https://www.albany.edu/academics',
  },
  admissions: {
    keywords: [
      'admission',
      'apply',
      'requirements',
      'gpa',
      'test score',
      'tuition',
    ],
    response:
      'For admissions information, visit https://admissions.albany.edu . We welcome applications year-round. Our admissions team is happy to discuss requirements and financial aid options!',
  },
  events: {
    keywords: ['event', 'activity', 'club', 'sports', 'concert', 'party'],
    response:
      'UAlbany hosts hundreds of events throughout the year! Check our events page for upcoming concerts, sports games, club meetings, and social activities: https://events.albany.edu/',
  },
  housing: {
    keywords: ['housing', 'dorm', 'residence', 'room', 'dormitory'],
    response:
      'We offer on-campus housing for first-year and upper-class students. Options include traditional residence halls and suite-style housing with modern amenities. Learn more: https://www.albany.edu/housing',
  },
  library: {
    keywords: ['library', 'book', 'research', 'study', 'resource'],
    response:
      'The University Library offers 24/7 access to millions of resources, study spaces, research databases, and librarian support. Perfect for group projects and individual study! Visit: https://library.albany.edu',
  },
  dining: {
    keywords: ['dining', 'food', 'cafeteria', 'restaurant', 'meal plan'],
    response:
      'Multiple dining options available including the main dining commons, cafes on campus, and partnerships with local restaurants. Various meal plans to fit every budget! Find dining info: https://www.albany.edu/auxiliary-services/dining-vending',
  },
};

/**
 * System prompt for Gemini to focus on UAlbany information
 */
const UALBANY_SYSTEM_PROMPT = `You are a helpful and friendly AI assistant for University at Albany (UAlbany). 
Your role is to help students and prospective students with information about:
- Campus life and facilities
- Academic programs and majors
- Admissions requirements
- Student events and activities
- Housing and dining options
- Library and research resources
- Student services

Be concise, friendly, and encouraging. If asked about topics outside UAlbany, 
politely redirect the conversation back to campus-related topics.
If you don't know specific information, suggest they contact the appropriate UAlbany department.`;

/**
 * Get Gemini API instance (initialized once)
 */
let genAI = null;
const initializeGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('📝 Gemini API key not configured - using mock responses');
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Get mock response based on keyword matching
 * @param {string} userMessage - The user's message
 * @returns {string} - Mock response based on keywords
 */
function getMockResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  // Check each response category for keyword matches
  for (const [key, data] of Object.entries(MOCK_RESPONSES)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        return data.response;
      }
    }
  }

  // Default response
  return "Great question! I'm a campus information bot. You can ask me about majors, admissions, campus life, events, housing, dining, and more. What would you like to know?";
}

/**
 * Send message to Gemini API
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI response
 */
async function getGeminiResponse(userMessage) {
  try {
    const genAI = initializeGenAI();

    if (!genAI) {
      // Fall back to mock if no API key
      return getMockResponse(userMessage);
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: UALBANY_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userMessage);
    const response = result.response.text();

    return response;
  } catch (error) {
    // Handle rate limit error (429)
    if (error.status === 429 || error.message?.includes('429')) {
      console.warn('⚠️  Rate limit reached - Gemini API (429 Too Many Requests)');
      return "🤖 The AI chatbot is temporarily busy due to high traffic. Please try again in a moment! In the meantime, here's what you can do: Visit https://www.albany.edu for more information about UAlbany.";
    }

    // Handle other API errors
    console.error('❌ Gemini API error:', error.message);
    console.log('📝 Falling back to mock responses');

    // Fall back to mock response on any other error
    return getMockResponse(userMessage);
  }
}

/**
 * Chat Endpoint Handler
 * POST /api/chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const chatWithBot = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid message - please provide a non-empty message',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'Message cannot be empty',
      });
    }

    if (trimmedMessage.length > 2000) {
      return res.status(400).json({
        status: 'error',
        error: 'Message is too long (max 2000 characters)',
      });
    }

    // Get response from Gemini or mock
    const response = await getGeminiResponse(trimmedMessage);

    return res.status(200).json({
      status: 'success',
      data: {
        response,
        usedMock: !process.env.GEMINI_API_KEY,
      },
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    next(error);
  }
};

/**
 * Health Check Endpoint
 * GET /api/chat/health
 * Returns chatbot configuration status
 */
const chatbotHealth = (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  res.status(200).json({
    status: 'success',
    data: {
      chatbotActive: true,
      apiConfigured: hasApiKey,
      model,
      useMock: !hasApiKey,
      message: hasApiKey
        ? `🤖 Gemini AI chatbot active (${model})`
        : '📝 Mock chatbot active - no API key configured',
    },
  });
};

module.exports = {
  chatWithBot,
  chatbotHealth,
  getMockResponse,
  getGeminiResponse,
};
