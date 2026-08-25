export default function CategoryTabs({ categories, activeCategory, onChange }) {
  return <nav className="customer-cats" aria-label="Menu categories">{categories.map((category) => <button className={activeCategory === category ? 'active' : ''} onClick={() => onChange(category)} key={category}>{category}</button>)}</nav>
}
