/**
 * UAlbany AI Chat Bot Module
 * Provides chat functionality with campus information
 * Supports both mock responses and real API integration
 * Uses: Variables, Functions, Events, Loops, localStorage, DOM manipulation
 */

// Storage keys for chat history
const CHAT_HISTORY_KEY = 'chatHistory';
const MAX_CHAT_HISTORY = 50;

// Campus knowledge base - mock responses
const CAMPUS_KNOWLEDGE_BASE = {
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
  default: {
    keywords: [],
    response:
      "Great question! I'm a campus information bot. You can ask me about majors, admissions, campus life, events, housing, dining, and more. What would you like to know?",
  },
};

/**
 * Initialize chat bot
 */
function initializeChatBot() {
  createChatBubble();
  loadChatHistory();
  attachChatEventListeners();
}

/**
 * Create floating chat bubble element
 */
function createChatBubble() {
  const chatBubbleContainer = document.createElement('div');
  chatBubbleContainer.id = 'chat-bubble-container';
  chatBubbleContainer.className = 'chat-bubble-container';

  chatBubbleContainer.innerHTML = `
    <!-- Chat Bubble Toggle Button -->
    <button 
      id="chat-bubble-btn" 
      class="chat-bubble-btn" 
      aria-label="Open chat"
      aria-expanded="false"
      type="button"
    >
      <i class="fas fa-comments"></i>
      <span class="chat-bubble-text">Chat with us!</span>
    </button>

    <!-- Chat Window -->
    <div id="chat-window" class="chat-window" style="display: none;" role="dialog" aria-labelledby="chat-header" aria-modal="true">
      <div class="chat-header" id="chat-header">
        <h3>UAlbany AI Chat Bot</h3>
        <button 
          id="close-chat-btn" 
          class="close-chat-btn" 
          aria-label="Close chat"
          type="button"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div id="chat-messages" class="chat-messages" role="log" aria-live="polite" aria-atomic="false">
        <div class="chat-message bot-message">
          <div class="message-content">
            <p>👋 Hi there! I'm the campus information bot. Ask me anything about UAlbany!</p>
          </div>
          <small class="message-time">Just now</small>
        </div>
      </div>

      <div class="chat-input-area">
        <input 
          type="text" 
          id="chat-input" 
          class="chat-input" 
          placeholder="Type your question..."
          aria-label="Chat message input"
          autocomplete="off"
        />
        <button 
          id="send-chat-btn" 
          class="send-chat-btn" 
          aria-label="Send message"
          type="button"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>

    <!-- Back-to-Top Button -->
    <a 
      href="#top" 
      class="back-to-top" 
      aria-label="Back to top"
      title="Back to top"
    >
      <i class="fas fa-chevron-up" aria-hidden="true"></i>
    </a>
  `;

  document.body.appendChild(chatBubbleContainer);
}

/**
 * Attach event listeners for chat functionality
 */
function attachChatEventListeners() {
  const chatBubbleBtn = document.getElementById('chat-bubble-btn');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatInput = document.getElementById('chat-input');
  const chatWindow = document.getElementById('chat-window');
  const backToTopBtn = document.querySelector('.back-to-top');

  // Toggle chat window
  chatBubbleBtn.addEventListener('click', () => {
    const isOpen = chatWindow.style.display !== 'none';
    chatWindow.style.display = isOpen ? 'none' : 'block';
    chatBubbleBtn.setAttribute('aria-expanded', !isOpen);
    chatBubbleBtn.setAttribute(
      'aria-label',
      isOpen ? 'Open chat' : 'Close chat',
    );

    // Focus on input when opened
    if (!isOpen) {
      setTimeout(() => chatInput.focus(), 100);
    }
  });

  // Close button
  closeChatBtn.addEventListener('click', () => {
    chatWindow.style.display = 'none';
    chatBubbleBtn.setAttribute('aria-expanded', false);
  });

  // Send message on button click
  sendChatBtn.addEventListener('click', sendChatMessage);

  // Send message on Enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  // Close chat on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWindow.style.display !== 'none') {
      chatWindow.style.display = 'none';
      chatBubbleBtn.setAttribute('aria-expanded', false);
    }
  });

  // Show/hide back-to-top button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
}

/**
 * Send chat message
 */
function sendChatMessage() {
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const userMessage = chatInput.value.trim();

  if (!userMessage) return;

  // Add user message to chat
  addMessageToChat(userMessage, 'user');

  // Clear input
  chatInput.value = '';

  // Save to history
  saveChatMessage(userMessage, 'user');

  // Get bot response
  const botResponse = getBotResponse(userMessage);

  // Add bot response after a short delay
  setTimeout(() => {
    addMessageToChat(botResponse, 'bot');
    saveChatMessage(botResponse, 'bot');
  }, 500);

  // Auto-scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Add message to chat display
 * @param {string} message - The message text
 * @param {string} sender - 'user' or 'bot'
 */
function addMessageToChat(message, sender) {
  const chatMessages = document.getElementById('chat-messages');

  // Escape HTML to prevent XSS
  const escapedMessage = escapeHtml(message);

  // Convert URLs to clickable links
  const messageWithLinks = escapedMessage.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}-message`;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  messageDiv.innerHTML = `
    <div class="message-content">
      <p>${messageWithLinks}</p>
    </div>
    <small class="message-time">${timeString}</small>
  `;

  chatMessages.appendChild(messageDiv);

  // Announce to screen readers
  const announcement = document.createElement('div');
  announcement.className = 'sr-only';
  announcement.setAttribute('role', 'status');
  announcement.textContent = `${sender === 'user' ? 'You' : 'Bot'}: ${message}`;
  chatMessages.appendChild(announcement);
}

/**
 * Get AI response to user message
 * MOCK VERSION - Replace with real API call for production
 * @param {string} userMessage - The user's question
 * @returns {string} - The bot's response
 */
function getBotResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  // Search knowledge base for matching response - Loop pattern
  for (const category in CAMPUS_KNOWLEDGE_BASE) {
    const entry = CAMPUS_KNOWLEDGE_BASE[category];

    // Check if any keywords match the user message
    const hasMatch = entry.keywords.some((keyword) =>
      lowerMessage.includes(keyword),
    );

    if (hasMatch) {
      return entry.response;
    }
  }

  // If no match, return default response
  return CAMPUS_KNOWLEDGE_BASE.default.response;
}

/**
 * INTEGRATION POINT: Replace this function with real API call
 * Example for OpenAI API:
 *
 * async function getBotResponseFromAPI(userMessage) {
 *   try {
 *     const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${OPENAI_API_KEY}` // Store securely, not in client-side code
 *       },
 *       body: JSON.stringify({
 *         model: 'gpt-3.5-turbo',
 *         messages: [
 *           { role: 'system', content: 'You are a helpful campus information assistant.' },
 *           { role: 'user', content: userMessage }
 *         ],
 *         max_tokens: 150
 *       })
 *     });
 *
 *     const data = await response.json();
 *     return data.choices[0].message.content;
 *   } catch (error) {
 *     console.error('API Error:', error);
 *     return 'Sorry, I\'m having trouble connecting. Please try again later.';
 *   }
 * }
 */

/**
 * Save message to chat history in localStorage
 * @param {string} message - The message text
 * @param {string} sender - 'user' or 'bot'
 */
function saveChatMessage(message, sender) {
  let chatHistory = getChatHistory();

  const messageItem = {
    text: message,
    sender: sender,
    timestamp: new Date().toISOString(),
  };

  chatHistory.push(messageItem);

  // Keep only the last MAX_CHAT_HISTORY messages
  if (chatHistory.length > MAX_CHAT_HISTORY) {
    chatHistory = chatHistory.slice(-MAX_CHAT_HISTORY);
  }

  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
}

/**
 * Get chat history from localStorage
 * @returns {array} - Array of chat messages
 */
function getChatHistory() {
  const history = localStorage.getItem(CHAT_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

/**
 * Load chat history into the chat window
 */
function loadChatHistory() {
  const chatHistory = getChatHistory();
  const chatMessages = document.getElementById('chat-messages');

  // Clear existing messages except the initial greeting
  const existingMessages = chatMessages.querySelectorAll(
    '.chat-message:not(:first-child)',
  );
  existingMessages.forEach((msg) => msg.remove());

  // Reload previous messages - Loop pattern
  chatHistory.forEach((message) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.sender}-message`;

    const messageDate = new Date(message.timestamp);
    const timeString = messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${escapeHtml(message.text)}</p>
      </div>
      <small class="message-time">${timeString}</small>
    `;

    chatMessages.appendChild(messageDiv);
  });
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Clear chat history
 */
function clearChatHistory() {
  localStorage.removeItem(CHAT_HISTORY_KEY);
  const chatMessages = document.getElementById('chat-messages');

  // Keep only the initial greeting
  const allMessages = chatMessages.querySelectorAll('.chat-message');
  allMessages.forEach((msg, index) => {
    if (index > 0) msg.remove();
  });
}

// Initialize chat bot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeChatBot();
});
