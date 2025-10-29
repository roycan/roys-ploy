# Roy's Ploy

A strengths-driven companion for sustainable long-term projects.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Philosophy

Roy's Ploy is built on the principle that sustainable achievement comes from **managing meaning and momentum, not tasks**. It's designed for people who find traditional project management draining because it works *with* your natural strengths, not against them.

Based on the **S.P.A.R.K. Framework**:
- **S**trategize & Select
- **P**ersonalize & Plan
- **A**ct & Adapt
- **R**eflect & Refine
- **K**eep Connected

## Features

### Core Functionality
- 📊 **Multi-project tracking** with status management (active/paused/done)
- 💡 **Idea Garden** for free-form capture and promotion
- 📖 **Learning Log** to track discovery and growth
- 🏆 **Win celebration** to maintain positive momentum
- 🔄 **Re-entry prompts** to make returning after interruptions effortless

### Data & Backup
- 💾 **Local-first** storage using localStorage
- 📥 **JSON backup/restore** with intelligent merge strategies
- 📊 **CSV exports** for projects, logs, wins, and ideas
- 📱 **Web Share API** support for easy mobile backups
- 🔒 **Privacy-focused**: all data stays on your device

### Calendar Integration
- 📅 **iCalendar (.ics) export** for weekly reviews
- ♻️ **Recurring events** with proper RRULE support
- 🔗 **Google Calendar** quick-add links
- ⏰ **Customizable** review cadence per project

### Mobile-First Design
- 📱 **Responsive** layout optimized for phone and desktop
- 👆 **Touch-friendly** with 44px minimum tap targets
- 🧭 **Bottom navigation** for easy thumb access
- ➕ **Context-aware FAB** for quick actions
- 📲 **PWA-ready** architecture (installable in Phase 2)

## Quick Start

### Option 1: GitHub Pages (Recommended)

1. **Fork this repository** or create a new one
2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from branch `main`, root `/`
3. **Visit your site**: `https://<username>.github.io/roys-ploy`

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/<username>/roys-ploy.git
cd roys-ploy

# Serve with any static file server
python3 -m http.server 8000
# or
npx serve

# Open in browser
open http://localhost:8000
```

No build step required! 🎉

## Technology Stack

- **HTML5** for semantic markup
- **[Bulma CSS](https://bulma.io)** via CDN for styling
- **Vanilla JavaScript** (ES modules, no frameworks)
- **localStorage** for persistence
- **Web APIs**: File System Access, Web Share, Clipboard

## File Structure

```
roys-ploy/
├── index.html              # App shell
├── styles/
│   ├── main.css            # Core styles and components
│   └── mobile.css          # Mobile-specific adjustments
├── scripts/
│   ├── app.js              # Entry point, router, state management
│   ├── storage.js          # localStorage abstraction, migrations
│   ├── models.js           # Data models and CRUD operations
│   ├── utils.js            # Helper functions
│   ├── export.js           # JSON, CSV, ICS exports
│   ├── import.js           # JSON import with merge logic
│   └── views/
│       ├── dashboard.js    # Dashboard view
│       ├── focus.js        # Project focus view
│       ├── garden.js       # Idea garden view
│       ├── log.js          # Learning log view
│       └── settings.js     # Settings and backup view
├── plan-v1.md              # Technical implementation plan
├── idea.md                 # Original design philosophy
└── README.md               # This file
```

## Usage Guide

### Creating Your First Project

1. Click the **+ button** (FAB) on the Dashboard
2. Fill in:
   - **Title**: What are you building?
   - **Purpose**: Why does this matter? (Connect to values)
   - **Beneficiaries**: Who will this help?
   - **Next Step**: The most exciting thing to do next
3. Click **Create Project**

### Logging Learning

1. Navigate to the **Learning Log** tab
2. Click **+ (Add Learning)**
3. Select your project
4. Answer:
   - What did you learn? (required)
   - What are you excited to learn next? (optional)
   - Who or what benefited? (optional)

### Weekly Review Flow

When a project is due for review:
1. You'll see a reminder on the Dashboard
2. Click the project to enter **Focus Mode**
3. Review your Why, Last Learned, and Next Step
4. Mark review complete

Optionally, export the review schedule to your calendar.

### Backup Strategy

**Recommended cadence**: Weekly (default reminder: 14 days)

**To backup**:
1. Go to **Settings**
2. Click **Download Backup (JSON)**
3. Save to a cloud folder (pCloud, Dropbox, etc.)

**To restore**:
1. Go to **Settings** → Import Backup
2. Choose file or paste JSON
3. Review preview and confirm

## Data Model

All data is stored in a single versioned document:

```json
{
  "version": 1,
  "projects": [...],
  "ideas": [...],
  "logs": [...],
  "wins": [...],
  "settings": {...}
}
```

See `plan-v1.md` for complete schema details.

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Safari 14+ (iOS and macOS)
- ✅ Firefox 90+

Progressive enhancements:
- **Web Share API**: Safari iOS 12.2+, Chrome Android 61+
- **File System Access API**: Chrome/Edge 86+ (desktop/Android only)

## Roadmap

### Phase 1: MVP (Current)
- ✅ Core views and navigation
- ✅ localStorage persistence
- ✅ JSON backup/restore
- ✅ CSV exports
- ✅ iCalendar exports
- ✅ Mobile-first responsive design

### Phase 2: Enhanced Experience
- [ ] PWA (service worker, manifest, installable)
- [ ] Browser notifications for review reminders
- [ ] Google Calendar API integration (OAuth)
- [ ] Dark mode
- [ ] Keyboard shortcuts (g+d, g+g, etc.)
- [ ] Search and advanced filters

### Phase 3: Advanced Features
- [ ] Encrypted backups (AES-GCM with passphrase)
- [ ] Collaborative sharing (read-only project links)
- [ ] Voice input (Web Speech API)
- [ ] Visual calendar/timeline view
- [ ] Streaks and insights dashboard

## Contributing

This is a personal project, but suggestions and feedback are welcome!

- **Issues**: Report bugs or request features via GitHub Issues
- **Philosophy**: Read `idea.md` to understand the design principles
- **Plan**: See `plan-v1.md` for technical details

## License

MIT License - feel free to fork and adapt for your own use.

## Acknowledgments

Built with:
- [Bulma CSS](https://bulma.io) for beautiful, responsive components
- [Font Awesome](https://fontawesome.com) for icons
- Inspiration from the Gallup CliftonStrengths philosophy

---

**Remember**: This tool is about *meaning management*, not task management. Focus on the why, celebrate learning, and make re-entry effortless. 🚀
