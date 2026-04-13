# MoBooka Mobile App

This folder contains the Expo React Native client for the MoBooka marketplace.

## Setup
1. `cd mobile`
2. `npm install`
3. `npm start`

## Running
- `npm start` to launch the Expo developer tools
- `npm run android` to open on Android emulator/device
- `npm run ios` to open on iOS simulator/device
- `npm run web` to run in a browser

## API Integration
The mobile app sends requests to the backend API at `http://localhost:5000/api` by default.
If your backend runs on a different host, update `mobile/src/api/api.js`.

## Features
- Browse published books
- Sign up and log in
- View book details
- Initiate Mobile Money purchases for MTN or Airtel
- View buyer purchase history in the dashboard
