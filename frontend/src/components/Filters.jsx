import { CATEGORIES } from '../categories.js'

function Filters({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="filters">
      <div className="search-input-wrap">
        <span className="search-input-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          className="search-input"
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select
        className="category-select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Filters
