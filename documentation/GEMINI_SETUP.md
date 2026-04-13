# Gemini AI Chatbot Setup Guide

## Quick Links
- **Gemini AI Studio:** https://ai.google.dev/
- **Get API Key:** https://ai.google.dev/
- **Documentation:** https://ai.google.dev/tutorials
- **Pricing:** Free tier - 1,000 requests/day (Gemini 2.5 Flash-Lite)

## Implementation Summary

### What Was Added

1. **Backend Chatbot Controller** (`server/controllers/chatbotController.js`)
   - Integrates with Google Gemini 2.5 Flash-Lite API
   - Falls back to mock responses if API key not configured
   - Handles 429 rate limit errors gracefully
   - Includes system prompt optimized for UAlbany campus info

2. **Chatbot Routes** (`server/routes/chat.js`)
   - `POST /api/chat` - Send message to chatbot
   - `GET /api/chat/health` - Check configuration status

3. **Frontend Integration** (`js/chat-bot.js`)
   - Updated to call backend API instead of mock-only
   - Async message handling with loading indicator
   - Better error handling and user feedback
   - 429 error shows friendly timeout message

4. **Environment Configuration** (`server/.env`)
   - Added `GEMINI_API_KEY` - Your API key (optional)
   - Added `GEMINI_MODEL` - Model selection (default: gemini-2.5-flash)

5. **Package Dependencies** (`server/package.json`)
   - Added `@google/generative-ai` for Gemini API client

## How It Works

### When API Key Is NOT Configured
```
User Input → Backend → Check .env for GEMINI_API_KEY
           → KEY NOT FOUND → Use Mock Responses
           → Match keywords → Send mock answer
Result: Chatbot responds with hardcoded campus info
```

### When API Key IS Configured
```
User Input → Backend → Check .env for GEMINI_API_KEY
           → KEY FOUND → Call Gemini API
           → Return AI response
Result: Chatbot responds with intelligent AI answer
```

### Error Handling
```
API Error 429 (Rate Limit) → 
"🤖 The AI chatbot is temporarily busy due to high traffic. 
Please try again in a moment!"

Other API Errors →
Fall back to mock responses automatically

Network Error →
"Unable to connect to the chat service. Please try again."
```

## Setup Instructions

### Step 1: Get Gemini API Key (Free)

1. Go to https://ai.google.dev/
2. Click "Get API Key" button
3. Sign in with your Google account (or create one)
4. Click "Create API key in new project"
5. Copy the generated API key

**Important:** Keep this key secure and never commit it to GitHub!

### Step 2: Add API Key to Environment

```bash
# Edit server/.env
GEMINI_API_KEY="Your GeminiAI_API_KEY here"
GEMINI_MODEL=gemini-2.5-flash
```

### Step 3: Install Dependencies

```bash
cd server
npm install @google/generative-ai
```

### Step 4: Restart Server

```bash
cd server
npm start
```

### Step 5: Verify It Works

```bash
# Test the chatbot
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about UAlbany programs"}'

# Check status
curl http://localhost:3001/api/chat/health | jq .
```

## Rate Limiting Information

| Plan | Free Tier | Pro Tier |
|------|-----------|----------|
| Requests/Day | 1,000 | Unlimited |
| Cost | Free | $0.075/1K input, $0.30/1K output |
| Model | Gemini 2.5 Flash-Lite | Gemini 2.5 Pro Max |
| Setup | Just an API key | Billing required |

**For a college project with ~50 users:** 1,000 requests/day is plenty!

## How to Avoid 429 Errors

1. **Implement caching** - Store responses in localStorage
2. **Rate limit on frontend** - Wait 1 second between requests
3. **Use mock mode during tests** - Just don't set the API key
4. **Monitor quotas** - Check usage in Gemini AI Studio dashboard

## Testing Without API Key

No setup needed! Just test with mock mode:

```bash
# Start server - uses mock by default
cd server && npm start

# Test it
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What about campus housing?"}'

# Mock response about housing will be returned
```

## Troubleshooting

**Q: "🤖 The chatbot is busy" - What does this mean?**
A: You've hit the 429 rate limit. This happens when:
- Too many requests in a short time
- Used all 1,000 daily requests
- Solution: Wait a few minutes or add your own API key for higher limits

**Q: I added the API key but chatbot still uses mock responses?**
A: 
1. Check if key is in `server/.env`
2. Restart the server: `npm start`
3. Verify with: `curl http://localhost:3001/api/chat/health`
4. Make sure @google/generative-ai is installed: `npm list @google/generative-ai`

**Q: Can I use OpenAI instead of Gemini?**
A: Yes! The architecture supports it. See `chatbotController.js` for integration point.

**Q: What if my API key expires?**
A: Gemini API keys don't expire. They'll work indefinitely while your Google account is active.

## Files Changed

- ✅ `server/.env` - Added GEMINI_API_KEY and GEMINI_MODEL
- ✅ `server/package.json` - Added @google/generative-ai dependency
- ✅ `server/controllers/chatbotController.js` - New file with Gemini integration
- ✅ `server/routes/chat.js` - New file with chatbot endpoints
- ✅ `server/server.js` - Added chatbot routes
- ✅ `js/chat-bot.js` - Updated frontend to use backend API
- ✅ `README.md` - Added Gemini setup documentation

## Next Steps

1. Get a free API key from https://ai.google.dev/
2. Add it to `server/.env` as `GEMINI_API_KEY="Your GeminiAI_API_KEY here"`
3. Restart the server
4. Start chatting! 🤖

## Support

- Gemini API Issues: https://support.google.com/ai/
- Documentation: https://ai.google.dev/tutorials
- Rate Limits: Check Gemini AI Studio dashboard
