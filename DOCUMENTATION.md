# UDBHAVA - Technical Documentation

This document provides a deep dive into the architecture, features, and technical components of the UDBHAVA Enterprise platform.

---

## 1. System Architecture

UDBHAVA is built using a decoupled architecture:
- **Backend**: Node.js/Express REST API serving JSON and managing server-side state.
- **Frontend**: High-performance Vanilla JavaScript (ES6+) with a custom CSS Design System.
- **Database**: MongoDB for persistent storage of products, orders, and cultural context.

---

## 2. Autonomous Festival Intelligence (AFI)

The core innovation of UDBHAVA is the AFI system, located in `server/festival-intelligence.js`.

### How it Works:
1. **Discovery**: On page load, the system checks if a festival is active. If the database is empty, the **AI Cultural Researcher** (powered by Gemini) looks up the Hindu Panchangam for the current year.
2. **Context Generation**: The AI generates a "Festival Context" including wishes, marketing copy, and a specific **VFX Mood**.
3. **Real-time Injection**: The frontend (`public/festival_system.js`) injects an editorial layer into the shop, applying specific themes (Saffron, Gold, Green) and high-end particles.

### VFX Breakdown:
- **Diwali/Spiritual**: Floating 3D Diyas and Rising Lanterns.
- **Republic Day**: Cinematic Air Show with tricolor smoke trails and Army Aircraft silhouettes.
- **Harvest (Sankranti)**: Falling golden grains.
- **Spring (Ugadi)**: Falling neem flowers and Mango Leaf Toranams.

---

## 3. Frontend Component System

The UI uses a modular CSS approach in `public/index.css`.
- **Global Design System**: Managed via CSS variables (colors, spacing, typography).
- **VFX Layers**: Managed via the `ambient-vfx-container` which hosts canvas and SVG-based animations.
- **Adaptive Layouts**: The editorial section automatically adjusts its grid and background based on the `templateType` returned by the server.

---

## 4. Backend Components

### Models (`server/models/`):
- `Festival.js`: Stores exact festival dates and template metadata.
- `FestivalContext.js`: Caches the AI-generated branding for 24 hours to optimize API usage.
- `Order.js`: Comprehensive order tracking with product snapshots.

### Controllers:
- `adminController.js`: Handles analytics, PDF/Excel reports, and inventory.
- `festivalController.js`: Interface between the intelligence engine and the shop.

---

## 5. Utility Scripts Guide

The project includes several CLI utilities for maintenance:
- `server/syncDynamicFestivals.js`: Manually triggers the AI to populate the entire year's festival calendar.
- `export_data.js` / `import_data.js`: Used for database migrations and backups.
- `import_products_to_db.js`: Batch imports products from JSON files.
- `add_fontawesome.ps1`: Automated PowerShell script to maintain icon consistency across 70+ HTML files.

---

## 6. Development & Deployment

Refer to [DEPLOY.md](file:///c:/pride%20pt%202%20project/DEPLOY.md) for environment configuration and [RENDER_GUIDE.md](file:///c:/pride%20pt%202%20project/RENDER_GUIDE.md) for cloud deployment steps.

---
*Technical Excellence in Indian Handcrafts.*
