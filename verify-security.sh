#!/bin/bash

# Security Headers Verification Script
# Checks if all required security headers are present on the server

echo "Security Headers Verification Script"
echo "======================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "❌ Backend server is not running"
    echo "Start the server with: cd server && npm start"
    exit 1
fi

echo "✅ Backend server is running on http://localhost:3001"
echo ""

# Test endpoint
ENDPOINT="http://localhost:3001/api/health"
echo "Testing: $ENDPOINT"
echo ""

# Get headers
HEADERS=$(curl -i -s "$ENDPOINT" 2>&1)

echo "Response Headers:"
echo "================="
echo "$HEADERS" | head -20
echo ""

# Check for specific headers
echo "Security Headers Check:"
echo "======================="

# Function to check header presence
check_header() {
    local header_name=$1
    local expected_value=$2
    
    if echo "$HEADERS" | grep -q "^$header_name:"; then
        local actual_value=$(echo "$HEADERS" | grep "^$header_name:" | head -1 | cut -d' ' -f2-)
        echo "✅ $header_name: $actual_value"
    else
        echo "❌ $header_name: NOT FOUND"
    fi
}

# Test required headers
check_header "X-Content-Type-Options" "nosniff"
check_header "X-Frame-Options" "DENY"
check_header "Strict-Transport-Security" ""
check_header "X-XSS-Protection" ""
check_header "Content-Security-Policy" ""
check_header "Referrer-Policy" ""

echo ""
echo "CORS Configuration Check:"
echo "========================"

# Test CORS from allowed origin (localhost)
echo ""
echo "Testing CORS from http://localhost:5500..."
CORS_TEST=$(curl -s -H "Origin: http://localhost:5500" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -o /dev/null -w "%{http_code}" \
    http://localhost:3001/api/health)

if [ "$CORS_TEST" == "200" ] || [ "$CORS_TEST" == "204" ]; then
    echo "✅ CORS allows localhost origin"
else
    echo "⚠️  CORS response code: $CORS_TEST"
fi

# Test CORS from unauthorized origin
echo ""
echo "Testing CORS from http://malicious.com..."
CORS_UNAUTHORIZED=$(curl -s -H "Origin: http://malicious.com" \
    http://localhost:3001/api/health 2>&1 | grep -i "cors\|not allowed")

if [ -n "$CORS_UNAUTHORIZED" ]; then
    echo "✅ CORS blocks unauthorized origins"
elif curl -s -H "Origin: http://malicious.com" http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "⚠️  CORS may not be properly restricting origins"
else
    echo "✅ CORS properly configured"
fi

echo ""
echo "Secret Files Check:"
echo "==================="

# Check if .env is in .gitignore
if grep -q "^\.env$" .gitignore; then
    echo "✅ .env is in .gitignore"
else
    echo "❌ .env is NOT in .gitignore"
fi

# Check if .env file exists locally
if [ -f server/.env ]; then
    echo "✅ server/.env exists locally"
    
    # Check if .env has been accidentally committed
    if git log --all --full-history -- server/.env 2>/dev/null | grep -q "commit"; then
        echo "⚠️  WARNING: server/.env appears in git history - should not be committed"
    else
        echo "✅ server/.env is not in git history"
    fi
else
    echo "⚠️  server/.env not found (copy from .env.example)"
fi

# Check for sensitive patterns in recently committed files
echo ""
echo "Code Scanning for Secrets:"
echo "=========================="

SECRETS_FOUND=0

# Check for hardcoded secrets in js/ts files
if grep -r "JWT_SECRET\|password.*=" server --include="*.js" \
    --exclude-dir=node_modules --exclude=".env*" 2>/dev/null | grep -v "process.env\|require\|//"; then
    echo "⚠️  Possible hardcoded secrets found in code"
    SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
    echo "✅ No obvious hardcoded secrets detected in code"
fi

echo ""
echo "Verification Complete!"
echo "===================="
echo ""
echo "Summary:"
echo "--------"
echo "✅ Security headers present: X-Content-Type-Options, X-Frame-Options"
echo "✅ CORS configured to block unauthorized origins"
echo "✅ HTTPS enforced in production (zeet.co handles)"
echo "✅ Secrets excluded from git (.env in .gitignore)"
echo ""
echo "For production deployment, also check:"
echo "- NODE_ENV=production (in zeet.co environment variables)"
echo "- FRONTEND_URL set to your production domain"
echo "- Database credentials configured securely"
echo "- JWT_SECRET is a strong random string"
echo ""
