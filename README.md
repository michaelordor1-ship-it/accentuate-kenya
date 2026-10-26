# Accentuate Kenya

A separate copy of Accentuate for Kenyan accent voices. It shares no code path, key, sheet or deployment with the main Nigerian app.

## What is different from the main app
- Kenya only: no country switcher, Kenyan copy, Kenyan anchors (Anchor 1, Anchor 2, Direct)
- ElevenLabs key comes from `VITE_ELEVENLABS_API_KEY`, nothing is hardcoded
- Own Google Sheet and Apps Script for usage and the shared voice library
- Own access list (`GUEST_ACCESS` in `src/App.jsx`), no lesson-log account

## Deploy
1. New GitHub repo (suggested: `accentuate-kenya`), upload this folder.
2. New Vercel project from that repo (framework: Vite).
3. Add the environment variables from `.env.example` in Vercel, then redeploy.

## Apps Script (usage and voice library)
1. New Google Sheet, Extensions, Apps Script, paste `apps_script_kenya.gs`, save.
2. Deploy as Web app (Execute as: Me, Access: Anyone), copy the URL into `VITE_LOG_SCRIPT_URL`.

## Before sharing
- Create a dedicated ElevenLabs API key for this app with a monthly credit limit, and restrict it to Text to Speech, Speech to Speech, Voices and Speech to Text.
- Add the Kenyan office emails to `GUEST_ACCESS`.
- Add the Anchor 2 voice ID once chosen.

## Known limit
Like the main app, the key is bundled into the browser build, so anyone with the site open can read it. A credit limit on the key caps the damage. A server proxy is the proper fix.
