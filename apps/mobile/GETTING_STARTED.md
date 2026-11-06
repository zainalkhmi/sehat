# Getting Started with Future Health

This guide will help you set up and run your app.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and add your keys
cp .env.example .env

# Start the development server
npm start
```

## Environment Setup

Copy `.env.example` to `.env` and fill in the required values:

### Medplum Configuration

Your app uses Medplum for cloud storage and authentication.

Check your `.env.example` file for the required configuration values.
Fill in the credentials for your backend service in `.env`.

### AI Chat Configuration

Your app includes the Chat feature with AI integration.

> **⚠️ Security Warning:** API keys are exposed client-side in
> React Native apps. For production, implement a backend proxy
> to keep your keys secure.

Get API keys for your selected providers:

- **OpenAI**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Google**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

Add the keys to your `.env` file:

```
EXPO_PUBLIC_OPENAI_API_KEY=your-api-key
EXPO_PUBLIC_GOOGLE_API_KEY=your-api-key
```

### HealthKit Setup (iOS Only)

Your app includes Apple HealthKit integration for health data access.

> **⚠️ Important:** HealthKit requires a custom development build.
> It will NOT work in Expo Go.

#### Building for iOS:

```bash
# Create native iOS project and run
npx expo prebuild --platform ios
npx expo run:ios

# Or use EAS Build
eas build --platform ios --profile development
```

#### Testing:

- Use a **physical iOS device** for best results
- Simulator has limited HealthKit support
- Add test data: Simulator → Features → Health → Health Data

#### Configuration:

Edit `lib/healthkit-config.ts` to customize which health metrics to collect.

## Your App Features

Based on your selections, your app includes:

- **Medplum Backend** - Cloud storage with user authentication
- **Chat** - AI-powered chat interface with LLM integration
- **Scheduler** - Recurring tasks and reminder management
- **Questionnaires** - FHIR-compliant health forms
- **HealthKit** - Apple Health data integration (iOS only)
- **Onboarding** - Welcome flow with consent management

## Running on Devices

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## Project Structure

```
├── app/              # Expo Router screens
│   ├── (tabs)/       # Bottom tab screens
│   ├── (onboarding)/ # Welcome and consent flow
│   └── questionnaire/# Health form screens
├── packages/         # Shared modules
│   └── account/      # User account management
│   └── chat/         # AI chat functionality
│   └── scheduler/    # Task scheduling
│   └── questionnaire/# FHIR forms
│   └── healthkit/    # Apple Health integration
│   └── medplum/     # Medplum integration
├── lib/              # App utilities
└── components/       # Reusable UI components
```

## Learn More

- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://expo.github.io/router/docs)
- [React Native](https://reactnative.dev)
