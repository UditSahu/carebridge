# CareBridge

> **AI-powered mental health support platform with RAG chatbot, real-time community, and personalized resources**

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_2.0-4285f4?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[Features](#features)** | **[Quick Start](#quick-start)** | **[Tech Stack](#tech-stack)** | **[Deployment](#deployment)** | **[Troubleshooting](#troubleshooting)** | **[Contributing](#contributing)**

---

## Features

| Feature | Description |
|---------|-------------|
| **RAG Chatbot** | Google Gemini with mental health research PDFs |
| **Community** | Anonymous real-time peer support channels |
| **Resources** | ML-powered personalized recommendations |
| **Counseling** | Licensed therapist directory |
| **Voice AI** | Emotional tone analysis therapy sessions |
| **Crisis Support** | Emergency hotlines and resources |

## Screenshots

<table>
  <tr>
    <td><img src="https://via.placeholder.com/400x250?text=Chatbot" alt="AI Chatbot"/></td>
    <td><img src="https://via.placeholder.com/400x250?text=Community" alt="Community"/></td>
  </tr>
  <tr>
    <td align="center"><b>AI Chatbot with Sources</b></td>
    <td align="center"><b>Anonymous Community</b></td>
  </tr>
</table>

## Quick Start

**Requirements:** Node.js 16+ & npm

```bash
git clone https://github.com/YOUR_USERNAME/carebridge.git
cd carebridge
npm install
cp .env.example .env  # Add your API keys
npm run dev           # http://localhost:8080
```

<details>
<summary><b>Detailed Setup (click to expand)</b></summary>

### Step 1: Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Get credentials: **Settings** > **API**
3. Run SQL: Copy `supabase/schema.sql` + `supabase/SETUP_COMMUNITY_DB.sql` to SQL Editor
4. Add to `.env`:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2: Google Gemini Setup

1. Get API key: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`:
```env
VITE_GOOGLE_API_KEY=your-key
GOOGLE_API_KEY=your-key
```

### Step 3: CLI Chatbot (Optional)

```bash
npm run ingest   # Ingest PDFs (first time)
npm run chatbot  # Start CLI chatbot
```

</details>


## Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### Frontend
- React 18 + TypeScript
- Vite + Tailwind CSS
- shadcn/ui
- React Router
- Sonner

</td>
<td valign="top" width="33%">

### Backend
- Supabase (PostgreSQL)
- Row Level Security
- Real-time subscriptions
- Email + Anonymous auth

</td>
<td valign="top" width="33%">

### AI/ML
- Google Gemini 2.0
- LangChain (RAG)
- Transformers.js
- TF-IDF + Cosine

</td>
</tr>
</table>

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
npm run build
vercel --prod
```

**Set env vars in Vercel Dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_API_KEY`

<details>
<summary><b>Alternative: Netlify</b></summary>

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

Add the same environment variables in Site Settings.
</details>

## Troubleshooting

<details>
<summary><b>"Failed to fetch" / Connection Errors</b></summary>

- Verify Supabase URL & key in `.env`
- Check Supabase project is active (not paused)
- Ensure RLS policies are configured
- Check browser console (F12)
</details>

<details>
<summary><b>Chatbot Not Responding</b></summary>

- Verify `VITE_GOOGLE_API_KEY` in `.env`
- Check key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check API rate limits
- Clear browser cache
</details>

<details>
<summary><b>Community Messages Not Loading</b></summary>

- Run `supabase/SETUP_COMMUNITY_DB.sql`
- Check RLS policies allow anonymous reads
- Verify `community_messages` table exists
- Check browser console
</details>

<details>
<summary><b>npm install Fails (Windows)</b></summary>

C++ build errors are from optional dependencies - **ignore them**.
```bash
npm install  # Run again, should work
```
No need for Visual Studio Build Tools.
</details>

**Need help?** Open an [issue](https://github.com/YOUR_USERNAME/carebridge/issues) with error details + browser console logs.

## Security

- Row Level Security (RLS) enabled
- Anonymous authentication supported
- End-to-end encryption
- HIPAA-ready architecture

## Contributing

Contributions welcome! Please open an issue or submit a PR.

## License

MIT License - see [LICENSE](LICENSE) file

---

## Crisis Resources

> **WARNING: This is a support tool, not a replacement for professional care.**

**Emergency:**
- **911** (US) or local emergency services
- **988** - Suicide & Crisis Lifeline
- **741741** - Crisis Text Line (text HOME)

---

## Credits

Built with React, Supabase, Google Gemini | UI by shadcn/ui | Mental health research from WHO

<div align="center">

**[Star this repo](https://github.com/YOUR_USERNAME/carebridge)** | **[Report Bug](https://github.com/YOUR_USERNAME/carebridge/issues)** | **[Request Feature](https://github.com/YOUR_USERNAME/carebridge/issues)**

Made for mental health support

</div>
