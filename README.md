# POLI: Your Political Science Companion

Welcome to **POLI** — an advanced, comprehensive platform designed for political scientists, students, historians, and academics. POLI bridges the gap between historical data, theoretical frameworks, geopolitical analysis, and interactive learning. 

## Features

- **Daily Briefings (Global & National)**: Receive dynamically generated daily contexts including significant historical events that happened on this day, curated current headlines across major global regions, and political trivia, customized by your country.
- **Deep Academic Encyclopedias**:
  - **Disciplines**: Explore structural dimensions of political science (e.g., Comparative Politics, International Relations, Political Economy).
  - **Ideologies**: Detailed dossiers on political theories, complete with their history, core tenets, prominent thinkers, and critiques.
  - **Organizations**: Analyze international bodies and NGOs, their funding structures, leadership, memberships, and historical impact.
  - **Political Parties**: Deep dives into national political parties, covering their platforms, historical performance, and key figures.
  - **Countries**: Rich geopolitical databases displaying national structures, demographics, economic indicators, and governmental systems.
- **Academic Export System**: Generate aesthetically pleasing, structured PDF dossiers and syllabi dynamically from any piece of academic content, perfect for quick reference and printing.
- **Simulation Engine**: Build your own state. Experiment with different forms of government, economic policies, and cultural traits, then observe how simulated historical events respond to your foundation.
- **Real-Time Integrations**: POLI integrates with a variety of external databases (Wikidata, OpenLibrary, ArXiv, Reddit, Semantic Scholar, etc.) to fetch the latest papers, discussions, and datasets related to your queries.
- **Personalized Experience**: Save your favorite concepts, track your reading history, adjust regional perspectives, and define your own visual environment (fonts, density, themes) through the extensive user preferences suite.

## Architecture & Technology

POLI is designed as a robust client-side React application powered by Vite, framed by a Node/Express backend that proxies API calls and manages integrations:
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, and Framer Motion for highly polished and responsive academic interfaces. 
- **Backend & Data Storage**: Supabase (PostgreSQL) and Firebase for persistent cross-device syncing, user authentication, and data retention.
- **Intelligent Context Generation**: AI integrations power the dynamic daily feeds, political simulations, and data curation pipelines.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment**:
   Duplicate `.env.example` to `.env` and fill in necessary keys (Gemini API, Firebase/Supabase credentials).
3. **Run Development Server**:
   ```bash
   npm run dev
   ```

Enjoy exploring the political universe with POLI.
