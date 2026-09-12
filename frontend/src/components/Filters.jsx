import { CATEGORIES } from '../categories.js'

function Filters({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="filters">
      <input
        className="search-input"
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
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
