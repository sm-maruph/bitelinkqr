import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MenuPagination({ currentPage, pageCount, onPageChange }) {
  if (pageCount <= 1) return null
  return <nav className="universal-menu-pagination" aria-label="Menu pages">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous menu page"><ChevronLeft size={16} /></button>
    {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <button className={currentPage === page ? 'active' : ''} onClick={() => onPageChange(page)} aria-current={currentPage === page ? 'page' : undefined} key={page}>{page}</button>)}
    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pageCount} aria-label="Next menu page"><ChevronRight size={16} /></button>
  </nav>
}
