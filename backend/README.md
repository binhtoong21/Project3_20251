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

## Database

This project uses MongoDB. You can run it locally using Docker for convenience.

### Running with Docker Compose

1.  Make sure you have Docker and Docker Compose installed.
2.  From the `backend` directory, run the following command to start the database in the background:

    ```bash
    npm run db:up
    ```

    This command starts a MongoDB container, creates a `bookstore` database, and ensures all data is saved in a Docker volume named `mongo-data` to prevent data loss.

3.  To stop the database container, run:

    ```bash
    npm run db:down
    ```

## Features

- Simple in-memory data storage
- CORS enabled for all origins
- Morgan logging in dev mode
- Pagination and sorting support

## Notes

This is a simplified backend designed to match frontend requirements. No authentication, no database - just a simple API for demo purposes.
