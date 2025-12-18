# HamLogbook

Smart Amateur Radio Logbook & Operations Companion

A production-ready React Native application for iOS and Android, designed for licensed amateur radio operators. This app replaces paper logs, Excel spreadsheets, and outdated desktop ham radio software with a modern, offline-first mobile solution.

## Features

### MVP (Free Tier)
- ✅ QSO Logging (Create/Edit/Delete)
- ✅ Automatic UTC timestamp
- ✅ Duplicate QSO detection
- ✅ Callsign validation
- ✅ Offline SQLite storage
- ✅ Basic insights (Total QSOs, Bands, Modes)
- ✅ ADIF export (limited)

### Premium Features
- 🔒 Cloud Sync & Backup
- 🔒 Callsign Lookup & Enrichment (QRZ/HamQTH)
- 🔒 DX Cluster with Intelligence
- 🔒 Smart Stats & Progress Tracking
- 🔒 Advanced Maps & Propagation Tools
- 🔒 Contest & Fast Operation Mode
- 🔒 Alerts & Notifications

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys in `.env`:
   - QRZ API credentials (for callsign lookup)
   - HamQTH API key (alternative callsign lookup)
   - RevenueCat keys (for subscriptions)
   - Sentry DSN (for error tracking)

3. For production, use `.env.production` and set variables via CI/CD secrets.

## Development

```bash
npm install
npm start
```

## Important

⚠️ **Never commit `.env` files to the repository.** They contain sensitive API keys.

## Architecture

- **React Native** with TypeScript
- **Offline-first** data layer (SQLite)
- **Clean architecture** (domain/data/UI separation)
- **Zustand** for state management
- **Feature-based** modular structure

## License

Proprietary - Commercial Product

