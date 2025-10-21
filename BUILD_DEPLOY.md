# Building and Deploying Khatabook

This document provides instructions on how to build and deploy the Khatabook application using Firebase Hosting.

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase account with a project set up

## Building the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

   This command will:
   - Compile the Next.js application
   - Generate static HTML files in the `out` directory (as configured in `next.config.js`)

## Deploying to Firebase

1. Login to Firebase (if not already logged in):
   ```bash
   firebase login
   ```

2. Initialize Firebase (if not already initialized):
   ```bash
   firebase init
   ```
   - Select "Hosting" when prompted
   - Select your Firebase project
   - Specify "out" as your public directory
   - Configure as a single-page app: No
   - Set up automatic builds and deploys: No

3. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```
   ```
   firebase deploy --only hosting:khatabook-nk
   ```

## Project Configuration

- **firebase.json**: Configures Firebase hosting to serve files from the `out` directory
- **next.config.js**: Configures Next.js to export static files to the `out` directory

## Troubleshooting

- If you encounter any issues with the build, try clearing the cache:
  ```bash
  rm -rf .next out
  npm run build
  ```

- If you need to update the Firebase hosting site, modify the "site" field in firebase.json