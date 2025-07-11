# VAI (Virtual Assistant Intelligence) App

## Overview
An AI-powered training and freelancer marketplace platform for Filipino virtual assistants.

## Key Modules
- User Authentication & Roles (Free, Premium, Admin)
- AI VA Assistant Module
- VA Training Modules (Free + Premium)
- Community Chat (Twitter-style)
- Freelancer Marketplace
- Admin Panel

## Tech Stack
- Frontend: Expo (React Native), TailwindCSS-like styling
- Backend: Supabase (auth, realtime, database, storage)
- AI: OpenAI GPT-4.5 / o4-mini
- Payment: Stripe or Paymongo
- Notifications: OneSignal

## Milestones
1. Auth + Trial + Payment (1 week)
2. Training Modules Core UI + Logic (2 weeks)
3. Marketplace + Card UI + Approval (2 weeks)
4. Community Chat with Moderation (1.5 weeks)
5. Polish & Publish to Play Store + App Store (1 week)

## UI/UX Guidelines
- Modern Filipino branding: Bright tones, minimalist flair
- Rounded Apple-style UI, glass cards
- Dark/Light Mode switch
- Mobile-first, 1-thumb navigation
- Minimal typing: tap/AI-assist first
- Emphasis on community, recognition, skill building

### Components
- Premium VA Banner Card: Frosted glass, circular photo, gold "Certified" badge, glowing border
- Chat Bubble: Twitter/X inspired, gold "PREMIUM" tag, long-press actions
- Training Progress: Horizontal tracker, lesson tiles, confetti animation on complete
- AI Assistant: Prompt bar, rich text output, save to profile toggle
