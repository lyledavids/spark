# Spark

A decentralized note-taking application built with Next.js, TypeScript, and Web3 technologies. This application allows users to create, store, and manage notes with file attachments using IPFS through the Apillon Storage API.

## Features

- Create and manage notes with rich text content
- Upload file attachments (images and PDFs) to IPFS
- Organize notes with tags and categories
- Web3 authentication
- Dark mode support
- Responsive design

## Prerequisites

- Node.js 16.x or higher
- Yarn or npm
- Apillon account with API credentials
- Web3 wallet (MetaMask recommended)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
NEXT_PUBLIC_APILLON_BUCKET_UUID=your-bucket-uuid
NEXT_PUBLIC_APILLON_API_KEY=your-api-key
NEXT_PUBLIC_APILLON_API_SECRET=your-api-secret
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
\`\`\`

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn
   \`\`\`
3. Set up environment variables as described above
4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Apillon Storage Integration

This project uses the Apillon SDK to store files on IPFS. The integration provides:

- Secure file uploads to IPFS
- Permanent storage with content addressing
- File management through the Apillon dashboard

### Testing the API Connection

You can test your Apillon API connection using the built-in API Test component in the dashboard.

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - React components
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and API clients
- `/public` - Static assets
- `/styles` - Global CSS styles

