# FSRS Flash Cards

A minimal, personal flashcard application using the FSRS (Free Spaced Repetition Scheduler) algorithm for optimal memory retention.

## Features

- 📚 **Collections** - Organize cards into collections
- 🧠 **FSRS Algorithm** - Intelligent spaced repetition scheduling via `ts-fsrs`
- ✍️ **Markdown Support** - Write cards in Markdown
- 🌓 **Light/Dark Mode** - Automatic theme based on system preference
- 📱 **Responsive** - Works on both mobile and desktop
- 🔌 **API** - RESTful API for external integrations (Obsidian, Logseq, etc.)
- 🐳 **Docker Ready** - Easy deployment with Docker

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Default credentials:
- Username: `admin`
- Password: `password`

### Production (Docker)

```bash
# Build and run with Docker Compose
docker compose up -d
```

Or build manually:

```bash
docker build -t fsrs-cards .
docker run -p 3000:3000 -v fsrs-data:/data fsrs-cards
```

## Configuration

Configuration is stored in `config.json` in the data directory:

```json
{
  "username": "admin",
  "password": "password",
  "apiToken": "your-api-token-here"
}
```

### Environment Variables

- `APP_DATA_DIR` - Directory for storing data files (default: `./data`)
- `SESSION_SECRET` - Secret key for session encryption

## API

### Authentication

Use Bearer token in the Authorization header:

```
Authorization: Bearer your-api-token-here
```

### Endpoints

#### Create Card

```http
POST /api/cards
Content-Type: application/json

{
  "collection": "Collection Name",
  "front": "# Question\n\nWhat is FSRS?",
  "back": "FSRS stands for Free Spaced Repetition Scheduler",
  "noteId": "optional-external-id"
}
```

#### Update Card

```http
PUT /api/cards/:id
Content-Type: application/json

{
  "front": "Updated question",
  "back": "Updated answer"
}
```

#### Get Due Cards

```http
GET /api/cards?due=true
```

#### Review Card

```http
POST /api/cards/:id/review
Content-Type: application/json

{
  "rating": 3
}
```

Rating values:
- 1 = Again
- 2 = Hard
- 3 = Good
- 4 = Easy

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) - FSRS algorithm
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering

## Data Storage

All data is stored as JSON files in the data directory:

- `config.json` - Application configuration
- `collections.json` - Collection definitions
- `cards.json` - Card data with FSRS scheduling fields

## License

MIT
