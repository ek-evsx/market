import { useEffect, useState } from 'react'
import Filters from './components/Filters.jsx'
import ItemCard from './components/ItemCard.jsx'
import Pagination from './components/Pagination.jsx'

function App() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const [items, setItems] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category])

  useEffect(() => {
    let ignore = false

    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (category) params.set('category', category)
    params.set('page', page)

    setLoading(true)
    setError(false)

    fetch(`/api/items?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then((data) => {
        if (ignore) return
        setItems(data.items)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      })
      .catch(() => {
        if (!ignore) setError(true)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [debouncedSearch, category, page])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Market</h1>
      </header>

      <main className="app-main">
        <Filters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {loading && <p className="status-text">Loading...</p>}
        {error && <p className="status-text error">Could not load items. Please try again.</p>}

        {!loading && !error && (
          <>
            <p className="results-count">{total} items found</p>

            {items.length === 0 ? (
              <p className="status-text">No items match your search.</p>
            ) : (
              <div className="grid">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
