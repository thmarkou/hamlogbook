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

## Quick Start

### Prerequisites

- Node.js 20.19.4 (use `nvm use`)
- npm or yarn
- Expo Go app (for mobile testing) or use web version

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```

### Running the App

#### Option 1: Web Version (Easiest)

```bash
npm start -- --web
```

Opens the app in your browser.

#### Option 2: iOS Simulator

1. Install Expo Go in the Simulator:
   - Open Simulator app
   - Open App Store in the simulator
   - Search for "Expo Go" and install it
2. Run `npm start` and press `i` for iOS

#### Option 3: Physical Device

1. Install Expo Go app on your iPhone (from App Store)
2. Run `npm start`
3. Scan the QR code with Expo Go app

#### Option 4: Development Build (For Production Testing)

```bash
npx expo run:ios
```

This builds a native app (requires Xcode).

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

## Troubleshooting

### Error: Expo Go not installed (Code 115)

- Install Expo Go in the Simulator's App Store, OR
- Use web version: `npm start -- --web`, OR
- Use physical device with Expo Go app

### Dependency Conflicts

If you encounter dependency issues:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Architecture

- **React Native** with TypeScript
- **Expo SDK 51** with Expo Router
- **Offline-first** data layer (SQLite)
- **Clean architecture** (domain/data/UI separation)
- **Zustand** for state management
- **Feature-based** modular structure

## Project Structure

```
src/
├── core/           # Domain logic & entities
├── features/       # Feature modules
├── shared/         # Shared components & utilities
├── app/            # App screens & navigation
└── store/          # Zustand state management
```

## Important

⚠️ **Never commit `.env` files to the repository.** They contain sensitive API keys.

## License

Proprietary - Commercial Product
