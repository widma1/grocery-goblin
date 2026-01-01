# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grocery Goblin is a vanilla JavaScript shopping list web application. It's a client-side only app with no build step or backend—just open `index.html` in a browser.

## Development

**Run locally:** Open `index.html` directly in a browser, or use any static file server:
```bash
npx serve .
# or
python -m http.server 8000
```

There are no build, test, or lint commands—this is a zero-dependency vanilla JS project.

## Architecture

The app consists of three files:
- `index.html` - Main HTML structure with share modal
- `app.js` - All application logic (item CRUD, localStorage persistence, URL sharing)
- `styles.css` - Styling with CSS animations

**Data flow:**
- Items are stored in `localStorage` as JSON under the key `goblinItems`
- Each item has: `{id, text, completed}` where `id` is a timestamp
- Lists can be shared via URL query parameter `?list=` containing encoded JSON array of item texts
- The `loadFromURL()` function handles importing shared lists on page load

**Key functions in app.js:**
- `addItem()`, `toggleItem()`, `deleteItem()`, `clearAll()` - Item management
- `renderList()` - DOM rendering with XSS protection via `escapeHtml()`
- `generateShareLink()`, `loadFromURL()` - URL-based sharing
- `shareViaSMS()` - SMS sharing via `sms:` protocol
