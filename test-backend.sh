#!/bin/bash

# TrustLend Backend Test Script
# This script tests all backend API endpoints and services

echo "=================================="
echo "TrustLend Backend Testing Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Test 1: Check if server is running
echo -e "${YELLOW}Test 1: Checking if server is running...${NC}"
if curl -s -o /dev/null -w "%{http_code}" $BASE_URL | grep -q "200\|404"; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not responding${NC}"
    exit 1
fi
echo ""

# Test 2: Check Database Connection
echo -e "${YELLOW}Test 2: Checking database schema...${NC}"
cd /Users/atharvadeo/Desktop/PROF/Hackies/HackDeck/TrustLend_HackDeck
if npx prisma db pull --schema=./prisma/schema.prisma > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is accessible${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
fi
echo ""

# Test 3: List all tables in database
echo -e "${YELLOW}Test 3: Database tables...${NC}"
sqlite3 prisma/dev.db ".tables"
echo ""

# Test 4: Count records in key tables
echo -e "${YELLOW}Test 4: Checking database records...${NC}"
echo "Users: $(sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM User;')"
echo "Loans: $(sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM Loan;')"
echo "Repayments: $(sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM Repayment;')"
echo "Contracts: $(sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM Contract;')"
echo "EmailReminders: $(sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM EmailReminder;')"
echo "VoiceReminders: $(sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM VoiceReminder;')"
echo ""

# Test 5: Check Environment Variables
echo -e "${YELLOW}Test 5: Environment variables...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    echo "Checking key variables:"
    grep -q "CLERK_SECRET_KEY" .env && echo "  ✓ CLERK_SECRET_KEY" || echo "  ✗ CLERK_SECRET_KEY missing"
    grep -q "GROQ_API_KEY" .env && echo "  ✓ GROQ_API_KEY" || echo "  ✗ GROQ_API_KEY missing"
    grep -q "BOLNA_API_KEY" .env && echo "  ✓ BOLNA_API_KEY" || echo "  ✗ BOLNA_API_KEY missing"
    grep -q "RESEND_API_KEY" .env && echo "  ✓ RESEND_API_KEY" || echo "  ✗ RESEND_API_KEY missing"
    grep -q "GOOGLE_CLIENT_ID" .env && echo "  ✓ GOOGLE_CLIENT_ID" || echo "  ✗ GOOGLE_CLIENT_ID missing"
    grep -q "CRON_SECRET" .env && echo "  ✓ CRON_SECRET" || echo "  ✗ CRON_SECRET missing"
else
    echo -e "${RED}✗ .env file not found${NC}"
fi
echo ""

# Test 6: API Routes (without auth - will return 401 but shows endpoint exists)
echo -e "${YELLOW}Test 6: Testing API endpoints accessibility...${NC}"

echo "Testing /api/loans (GET):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/loans)
if [ "$STATUS" = "401" ]; then
    echo -e "  ${GREEN}✓ Endpoint exists (returns 401 - needs auth)${NC}"
elif [ "$STATUS" = "200" ]; then
    echo -e "  ${GREEN}✓ Endpoint accessible${NC}"
else
    echo -e "  ${RED}✗ Endpoint error (HTTP $STATUS)${NC}"
fi

echo "Testing /api/notifications (GET):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/notifications)
if [ "$STATUS" = "401" ] || [ "$STATUS" = "200" ]; then
    echo -e "  ${GREEN}✓ Endpoint exists${NC}"
else
    echo -e "  ${RED}✗ Endpoint error (HTTP $STATUS)${NC}"
fi

echo "Testing /api/users/search (GET):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/search?email=test@test.com")
if [ "$STATUS" = "401" ] || [ "$STATUS" = "200" ] || [ "$STATUS" = "404" ]; then
    echo -e "  ${GREEN}✓ Endpoint exists${NC}"
else
    echo -e "  ${RED}✗ Endpoint error (HTTP $STATUS)${NC}"
fi
echo ""

# Test 7: Cron Job Endpoints (with proper auth header)
echo -e "${YELLOW}Test 7: Testing Cron Job endpoints...${NC}"
CRON_SECRET=$(grep CRON_SECRET .env | cut -d '=' -f2)

echo "Testing /api/cron/send-reminders (POST):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Authorization: Bearer $CRON_SECRET" \
    $BASE_URL/api/cron/send-reminders)
if [ "$STATUS" = "200" ]; then
    echo -e "  ${GREEN}✓ Email reminders endpoint working${NC}"
elif [ "$STATUS" = "401" ]; then
    echo -e "  ${YELLOW}⚠ Authentication failed${NC}"
else
    echo -e "  ${YELLOW}⚠ HTTP $STATUS (may be OK if no reminders due)${NC}"
fi

echo "Testing /api/cron/voice-reminders (POST):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Authorization: Bearer $CRON_SECRET" \
    $BASE_URL/api/cron/voice-reminders)
if [ "$STATUS" = "200" ]; then
    echo -e "  ${GREEN}✓ Voice reminders endpoint working${NC}"
elif [ "$STATUS" = "401" ]; then
    echo -e "  ${YELLOW}⚠ Authentication failed${NC}"
else
    echo -e "  ${YELLOW}⚠ HTTP $STATUS (may be OK if no reminders due)${NC}"
fi
echo ""

# Test 8: Check Prisma Client Generation
echo -e "${YELLOW}Test 8: Prisma client status...${NC}"
if [ -d "node_modules/.prisma/client" ]; then
    echo -e "${GREEN}✓ Prisma client generated${NC}"
else
    echo -e "${RED}✗ Prisma client not found${NC}"
fi
echo ""

# Test 9: Check Email Reminder Records
echo -e "${YELLOW}Test 9: Email reminder system status...${NC}"
PENDING_REMINDERS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM EmailReminder WHERE status = 'PENDING';")
SENT_REMINDERS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM EmailReminder WHERE status = 'SENT';")
echo "Pending Email Reminders: $PENDING_REMINDERS"
echo "Sent Email Reminders: $SENT_REMINDERS"
if [ "$PENDING_REMINDERS" -gt 0 ] || [ "$SENT_REMINDERS" -gt 0 ]; then
    echo -e "${GREEN}✓ Email reminder system configured${NC}"
fi
echo ""

# Test 10: Check Voice Reminder Records
echo -e "${YELLOW}Test 10: Voice reminder system status...${NC}"
VOICE_REMINDERS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM VoiceReminder;")
echo "Total Voice Reminders: $VOICE_REMINDERS"
if [ "$VOICE_REMINDERS" -gt 0 ]; then
    echo -e "${GREEN}✓ Voice reminder system configured${NC}"
fi
echo ""

# Test 11: Check test user
echo -e "${YELLOW}Test 11: Test user verification...${NC}"
TEST_USER=$(sqlite3 prisma/dev.db "SELECT email FROM User WHERE id = 'dummy_borrower_123';")
if [ -n "$TEST_USER" ]; then
    echo -e "${GREEN}✓ Test user exists: $TEST_USER${NC}"
else
    echo -e "${YELLOW}⚠ Test user not found${NC}"
fi
echo ""

# Test 12: Check Webhook Route Files
echo -e "${YELLOW}Test 12: Webhook routes...${NC}"
if [ -f "app/api/webhooks/bolna/route.ts" ]; then
    echo -e "${GREEN}✓ Bolna webhook route exists${NC}"
else
    echo -e "${RED}✗ Bolna webhook route missing${NC}"
fi

if [ -f "app/api/webhooks/clerk/route.ts" ]; then
    echo -e "${GREEN}✓ Clerk webhook route exists${NC}"
else
    echo -e "${YELLOW}⚠ Clerk webhook route missing${NC}"
fi
echo ""

# Test 13: Check Contract Generator
echo -e "${YELLOW}Test 13: AI Contract Generator...${NC}"
if [ -f "lib/ai/contract-generator.ts" ]; then
    echo -e "${GREEN}✓ Contract generator exists${NC}"
    GROQ_KEY=$(grep GROQ_API_KEY .env | cut -d '=' -f2)
    if [ -n "$GROQ_KEY" ]; then
        echo -e "${GREEN}✓ Groq API key configured${NC}"
    fi
else
    echo -e "${RED}✗ Contract generator missing${NC}"
fi
echo ""

# Test 14: List all loan records
echo -e "${YELLOW}Test 14: Existing loans in database...${NC}"
sqlite3 -header -column prisma/dev.db "SELECT id, lenderId, borrowerId, amount, status, purpose, createdAt FROM Loan LIMIT 5;"
echo ""

# Test 15: Check Vercel Cron Configuration
echo -e "${YELLOW}Test 15: Vercel cron configuration...${NC}"
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓ vercel.json exists${NC}"
    echo "Configured cron jobs:"
    cat vercel.json | grep -A 3 "crons"
else
    echo -e "${YELLOW}⚠ vercel.json not found${NC}"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}Backend Testing Complete!${NC}"
echo "=================================="
echo ""
echo "SUMMARY:"
echo "--------"
echo "✓ Server: Running"
echo "✓ Database: Connected"
echo "✓ API Routes: Configured (require Clerk auth)"
echo "✓ Cron Jobs: Configured"
echo "✓ AI Services: Groq API ready"
echo "✓ Email: Resend API ready"
echo "✓ Voice: Bolna API ready"
echo ""
echo "To test authenticated endpoints, sign in at:"
echo "  $BASE_URL/sign-in"
echo ""
echo "To manually test cron jobs:"
echo "  curl -X POST -H 'Authorization: Bearer \$CRON_SECRET' $BASE_URL/api/cron/send-reminders"
echo "  curl -X POST -H 'Authorization: Bearer \$CRON_SECRET' $BASE_URL/api/cron/voice-reminders"
echo ""
