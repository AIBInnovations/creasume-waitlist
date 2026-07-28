import { useEffect, useMemo, useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'
import Footer from '../components/Footer.jsx'
import Seo from '../shared/Seo.jsx'
import CreatorCard from '../components/CreatorCard.jsx'
import { fetchCreators } from '../services/influenceApi.js'

// "Discover Top Creators" — public directory of live creator cards. Fetches the
// published creators from GET /public/creators and renders a searchable grid.

const FONT = "'Outfit', sans-serif"

const BUDGETS = [
  { id: 'all', label: 'All Budgets', test: () => true },
  { id: 'lt2k', label: 'Under ₹2,000', test: (p) => p != null && p < 2000 },
  { id: '2to5', label: '₹2,000 – ₹5,000', test: (p) => p != null && p >= 2000 && p <= 5000 },
  { id: 'gt5k', label: 'Over ₹5,000', test: (p) => p != null && p > 5000 },
]

export default function BrowseCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [budget, setBudget] = useState('all')

  useEffect(() => {
    window.scrollTo(0, 0)
    let alive = true
    fetchCreators()
      .then((list) => { if (alive) setCreators(list) })
      .catch((e) => { if (alive) setError(e.message || 'Failed to load creators') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(creators.map((c) => c.niche).filter(Boolean)))],
    [creators],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const budgetTest = (BUDGETS.find((b) => b.id === budget) || BUDGETS[0]).test
    return creators.filter((c) => {
      if (cat !== 'All' && c.niche !== cat) return false
      if (!budgetTest(c.startingPrice)) return false
      if (!q) return true
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.username || '').toLowerCase().includes(q) ||
        (c.niche || '').toLowerCase().includes(q)
      )
    })
  }, [creators, query, cat, budget])

  const selectStyle = { fontFamily: FONT, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.10)', color: '#fff' }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip bg-black text-white">
      <Seo
        title="Browse Creators — Verified Instagram Media Kits | Creasume"
        description="Discover verified creators on Creasume. Browse real Instagram media kits with live follower stats, niches and collaboration packages — and connect with the right creator for your brand."
        path="/browse"
      />
      <div className="starfield" />
      <SiteNav active="browse" />

      {/* ============ HERO ============ */}
      <section className="relative z-10 px-6 sm:px-12 md:px-20 pt-6 md:pt-10 pb-6 text-center">
        <h1 className="font-bold leading-tight" style={{ fontFamily: FONT, fontSize: 'clamp(36px, 6vw, 60px)' }}>Discover Top Creators</h1>
        <p className="mt-4 text-white/55 mx-auto max-w-2xl text-[15px] md:text-[18px] leading-relaxed" style={{ fontFamily: FONT }}>
          Browse verified dynamic media kits, compare transparent pricing, and connect directly with creators for your next campaign.
        </p>
      </section>

      {/* ============ SEARCH + FILTERS ============ */}
      <section className="relative z-10 px-6 sm:px-10 md:px-20 lg:px-28 mb-10">
        <div className="mx-auto max-w-6xl rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, handle, or tags…"
              className="w-full rounded-xl h-12 pl-11 pr-4 text-[15px] text-white outline-none placeholder:text-white/35"
              style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl h-12 px-4 text-[15px] outline-none cursor-pointer sm:w-52" style={selectStyle}>
            {categories.map((c) => <option key={c} value={c} style={{ color: '#000' }}>{c}</option>)}
          </select>
          <select value={budget} onChange={(e) => setBudget(e.target.value)} className="rounded-xl h-12 px-4 text-[15px] outline-none cursor-pointer sm:w-52" style={selectStyle}>
            {BUDGETS.map((b) => <option key={b.id} value={b.id} style={{ color: '#000' }}>{b.label}</option>)}
          </select>
        </div>
      </section>

      {/* ============ GRID ============ */}
      <section className="relative z-10 px-6 sm:px-10 md:px-20 lg:px-28 pb-20 flex-1">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border animate-pulse" style={{ background: '#0e0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="relative h-24" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="absolute -bottom-9 left-6 w-[76px] h-[76px] rounded-full border-4" style={{ borderColor: '#0e0e14', background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                  <div className="px-6 pt-12 pb-6">
                    <div className="h-5 w-32 rounded bg-white/10" />
                    <div className="mt-2 h-3 w-24 rounded bg-white/[0.06]" />
                    <div className="mt-5 h-3 w-40 rounded bg-white/[0.06]" />
                    <div className="mt-5 h-10 w-full rounded-xl bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-[#FB7185] text-center py-16" style={{ fontFamily: FONT }}>{error}</p>
          ) : (
            <>
              <p className="text-white/70 font-semibold mb-6" style={{ fontFamily: FONT }}>
                Showing {filtered.length} creator{filtered.length === 1 ? '' : 's'}
              </p>
              {filtered.length === 0 ? (
                <p className="text-white/45 text-center py-16" style={{ fontFamily: FONT }}>No creators match your search.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((c) => <CreatorCard key={c.username || c.publicId} c={c} />)}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
