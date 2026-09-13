function pageWindow(page, totalPages, size = 5) {
  const half = Math.floor(size / 2)
  let start = Math.max(1, page - half)
  const end = Math.min(totalPages, start + size - 1)
  start = Math.max(1, end - size + 1)

  const pages = []
  for (let p = start; p <= end; p++) pages.push(p)
  return pages
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        className="pagination-arrow"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {pageWindow(page, totalPages).map((p) => (
        <button
          key={p}
          className={`pagination-page ${p === page ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="pagination-arrow"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}

export default Pagination
