import { useState, useEffect } from 'react'
import BookCard from '../components/BookCard'
import { listBooks } from '../../shared/utils/booksService'
import './page.css'

export default function Books() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const fetchBooks = async () => {
      try {
        const response = await listBooks({ page: 1, limit: 100 })
        if (!mounted) return
        setBooks(response.items || [])
      } catch (err) {
        console.error('Failed to load books:', err)
        if (mounted) setError('Failed to load books')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchBooks()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="page books-page">
        <div className="container">
          <p>Loading books...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page books-page">
        <div className="container">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page books-page">
      <div className="container">
        <h2>Books</h2>
        <div className="grid">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </div>
    </div>
  )
}
