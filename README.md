# KhataBook App

A modern web application for tracking money lent to friends and monitoring order statuses.

## Features

- **User Authentication**: Secure login and registration system
- **Contact Management**: Keep track of people you lend money to
- **Transaction Tracking**: Record and monitor money lent and repayments
- **Order Tracking**: Track delivery status, returns, and refunds for orders
- **CSV Import/Export**: Easily import and export data using CSV files
- **Data Visualization**: Visual representation of your financial data
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Easy on the eyes in low-light environments

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **State Management**: React Context API with hooks
- **Form Handling**: React Hook Form with Zod validation
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Hosting**: Vercel (recommended)

## Project Structure

```
khatabook/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Authentication pages
│   │   └── (app)/           # Protected app pages
│   ├── components/          # React components
│   │   ├── ui/              # UI components
│   │   └── layout/          # Layout components
│   ├── lib/                 # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   └── types/               # TypeScript type definitions
├── .env.local               # Environment variables
└── ...                      # Config files
```

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/khatabook.git
   cd khatabook
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up Storage
5. Add a web app to your Firebase project and copy the configuration

## Deployment

The easiest way to deploy the app is using Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.