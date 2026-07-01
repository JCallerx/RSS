# Gator

Gator is a lightweight CLI-based RSS reader built with TypeScript, PostgreSQL, and Drizzle ORM. It lets you register users, add and follow feeds, scrape RSS content, and browse posts that have been stored for the currently logged-in user.

## Features

- Register and log in users
- Add feeds to the database
- Follow and unfollow feeds
- Fetch RSS content from feeds
- Store posts for followed feeds
- Browse the latest posts for the active user
- Run periodic feed aggregation

## Tech Stack

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM
- fast-xml-parser

## Prerequisites

- Node.js 18+ recommended
- PostgreSQL running locally or remotely

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a config file at ~/.gatorconfig.json with your database URL:
   ```json
   {
     "db_url": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable",
     "current_user_name": ""
   }
   ```

3. Generate and apply database migrations:
   ```bash
   npm run generate
   npm run migrate
   ```

4. Start the CLI:
   ```bash
   npm start -- <command>
   ```

## Usage

### Register a user
```bash
npm start -- register alice
```

### Log in as a user
```bash
npm start -- login alice
```

### Add a feed
```bash
npm start -- addfeed "Hacker News" https://hnrss.org/newest
```

### Follow a feed
```bash
npm start -- follow https://hnrss.org/newest
```

### See your followed feeds
```bash
npm start -- following
```

### Browse posts for the current user
```bash
npm start -- browse 10
```

### Start feed aggregation
```bash
npm start -- agg 30s
```

### Reset the database
```bash
npm start -- reset
```

## Notes

- The current user is stored in your config file via `current_user_name`.
- The aggregation command periodically fetches feeds and stores new posts in the database.
- The browse command shows the most recent posts from feeds that the current user follows.
