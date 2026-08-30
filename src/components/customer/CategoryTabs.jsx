export default function CategoryTabs({ categories, activeCategory, onChange }) {
  const promoted = ['Popular now', 'Offers', 'Combo offers']
  const primaryCategories = categories.filter((category) => !promoted.includes(category))
  const promotedCategories = promoted.filter((category) => categories.includes(category))
  const renderCategory = (category) => <button className={activeCategory === category ? 'active' : ''} onClick={() => onChange(category)} key={category}>{category}</button>
  return <div className="customer-category-stack">
    <nav className="customer-cats customer-cats-primary" aria-label="Food categories">{primaryCategories.map(renderCategory)}</nav>
    {promotedCategories.length > 0 && <nav className="customer-cats customer-cats-promoted" aria-label="Featured menu filters">{promotedCategories.map(renderCategory)}</nav>}
  </div>
}
