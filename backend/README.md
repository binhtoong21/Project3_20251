# Bookstores Backend

Simple REST API for bookstore frontend.

## Run locally

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

API will run at `http://localhost:3000` by default (configurable via `PORT` env variable).

## Endpoints

- `GET /health` - service status
- `GET /api/books` - list books (supports pagination: `?page=1&limit=20`, sorting: `?sort=price&order=desc`)
- `GET /api/books/:id` - get book by ID

## Features

- Simple in-memory data storage
- CORS enabled for all origins
- Morgan logging in dev mode
- Pagination and sorting support

## Notes

This is a simplified backend designed to match frontend requirements. No authentication, no database - just a simple API for demo purposes.
