# Bookstores - Frontend (Vite + React)

Frontend application for bookstore e-commerce built with Vite + React.

## Features

- Client-side routing with `react-router-dom`
- Pages: Home, Books, BookDetail, Cart, Login
- Components: Header, Footer, BookCard, HeroSlider, BookSection
- API integration with backend
- Responsive design

## Quick Start

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Project Structure

- `src/App.jsx` - Application router and layout
- `src/customer/` - Customer-facing pages and components
- `src/admin/` - Admin pages (placeholder)
- `src/shared/` - Shared utilities and services
  - `utils/apiClient.js` - API client
  - `utils/booksService.js` - Books API service
  - `utils/formatters.js` - Price formatting (VND)

## API Integration

All pages now fetch data from backend API:
- Home page: Featured, New Arrivals, On Sale sections
- Books page: Full catalog
- BookDetail page: Individual book details

## Images

Place book cover images in `public/images/books/` with filenames matching the book data.
- Example: `public/images/books/clean-code.jpg`
- Placeholder images are shown automatically if files are missing

## Next Steps

- Implement cart functionality
- Add user authentication
- Add search and filtering
- Add pagination controls
