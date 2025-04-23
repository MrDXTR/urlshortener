# URL Shortener

![URL Shortener Logo](/public/Logo.png)

A modern, fast, and secure URL shortening service built with the T3 Stack.

## Features

- ✨ Create shortened URLs instantly
- 🔒 User authentication for managing your links
- 🔗 Custom slugs for registered users
- 📊 Analytics for tracking link performance
- 🚀 Fast redirects with minimal latency
- 🛡️ Content filtering for safer browsing
- 🌓 Light/Dark mode support
- 🧰 Command-line interface (CLI) for developers
- 🔌 RESTful API for integration with your applications
- 📱 iOS Shortcut support

## Tech Stack

This project leverages the powerful T3 Stack:

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Database ORM**: [Prisma](https://prisma.io)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **API Layer**: [tRPC](https://trpc.io)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (recommended) or other database supported by Prisma

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your database and authentication settings
   ```

4. Run database migrations
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Create a shortened URL**: Enter a long URL in the input field
2. **Track your links**: Sign in to view analytics for your shortened URLs
3. **Customize slugs**: Create personalized, memorable links
4. **Share**: Copy and share your shortened URLs anywhere

## API Integration

Our service provides a RESTful API for developers to integrate URL shortening into their applications.

### Base URL
```
https://www.shorturlx.xyz/api
```

### Authentication
API requests require an API key that you can obtain from your account dashboard. Include the API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

### Rate Limits
- **Authenticated**: 100 requests per 10 minutes
- **Unauthenticated**: 10 requests per 10 minutes

### Endpoints

#### Create a Shortened URL
```
POST /api/shorten
```

Request body:
```json
{
  "url": "https://example.com/very-long-url",
  "customSlug": "my-custom-slug"  // Optional
}
```

For full API documentation, visit our [API Documentation](https://www.shorturlx.xyz/api-docs) page.

## CLI Tool

We provide an official command-line interface for creating shortened URLs directly from your terminal.

### Installation

```bash
npm install -g shorturlx-cli
```

### Basic Usage

```bash
shorturlx --url "https://example.com/very-long-url" --api-key "YOUR_API_KEY"
```

### Features

- Shorten URLs with a simple command
- Support for custom slugs
- Automatic clipboard copying
- Colorized output
- API key authentication

### Options

| Option | Description |
|--------|-------------|
| `--url, -u` | The URL to shorten (required) |
| `--custom, -c` | Custom slug (optional) |
| `--api-key, -k` | Your API key (can also be set via environment variable) |
| `--endpoint, -e` | API endpoint (defaults to our official endpoint) |
| `--copy, -cp` | Copy shortened URL to clipboard (defaults to true) |
| `--help` | Show help |

For more details on the CLI tool, visit our [API Documentation](https://www.shorturlx.xyz/api-docs) page.

## Deployment

This application can be deployed on any platform that supports Next.js applications:

- [Vercel](https://vercel.com) (Recommended)
- [Netlify](https://netlify.com)
- [Docker](https://www.docker.com/)

Follow the platform-specific deployment guides for detailed instructions.

## Project Structure

- `/src/app` - Next.js App Router pages and layouts
- `/src/app/_components` - React components for the UI
- `/src/server` - Server-side code and API routes
- `/src/server/api` - tRPC API endpoints
- `/src/server/auth` - Authentication configuration
- `/src/trpc` - tRPC client and server configuration
- `/public` - Static assets like images and icons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [T3 Stack](https://create.t3.gg/) for the excellent project structure
- [Vercel](https://vercel.com) for hosting and deployment solutions
- All open-source contributors whose libraries make this project possible
