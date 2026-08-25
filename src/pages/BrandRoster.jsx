import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'
import Footer from '../components/Footer.jsx'
import Seo from '../shared/Seo.jsx'
import CreatorCard from '../components/CreatorCard.jsx'
import { fetchRoster } from '../services/influenceApi.js'

// A brand/agency's shareable, admin-curated roster of creators — same card
// grid as BrowseCreators, but scoped to one admin-generated set instead of
// the full public directory. Lives at /roster/:slug (see Root.jsx).

const FONT = "'Inter', sans-serif"

// Brand names are free-text admin input (e.g. "coco cola") — title-case for
// display so the badge next to a polished brand logo doesn't look raw/unstyled.
const titleCase = (s) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

export default function BrandRoster({ slug, fallback = null }) {
  const [brandName, setBrandName] = useState('')
  const [brandLogo, setBrandLogo] = useState('')
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    let alive = true
    fetchRoster(slug)
      .then((res) => {
        if (!alive) return
        setBrandName(res.brandName)
        setBrandLogo(res.brandLogo)
        setCreators(res.creators)
      })
      .catch((e) => {
        if (!alive) return
        if (e.status === 404) setNotFound(true)
        else setError(e.message || 'Failed to load this page')
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [slug])

  // Root-level agency URLs share the same /<name> shape as creator cards.
  // If the API says this isn't an agency, render the creator route unchanged.
  if (!loading && notFound && fallback) return fallback

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip bg-black text-white">
      <Seo
        title={brandName ? `Creators managed by ${brandName} — Creasume` : 'Creator Roster — Creasume'}
        description={brandName ? `Browse the creators ${brandName} works with on Creasume.` : 'A curated Creasume creator roster.'}
        path={`/roster/${slug}`}
        noindex
      />
      <div className="starfield" />
      {/* Bare logo header — a shared/external link, so no marketing nav/CTA,
          and no pill background behind the logo. */}
      <SiteNav links={[]} login={false} cta={null} bare />

      <section className="relative z-10 px-6 sm:px-12 md:px-20 pt-6 md:pt-10 pb-6 text-center">
        {/* Small badge — logo + brand name, like a "made by" credit line. */}
        {brandName && (
          <div className="inline-flex items-center gap-4 sm:gap-5 mb-6" style={{ fontFamily: FONT }}>
            {brandLogo && (
              <img
                src={brandLogo}
                alt={brandName}
                className="h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full object-cover border border-white/15 shrink-0"
              />
            )}
            <span className="text-2xl sm:text-3xl font-semibold text-white/80">{titleCase(brandName)}</span>
          </div>
        )}
        {/* The actual headline — big and bold. */}
        <h1 className="font-bold leading-tight" style={{ fontFamily: FONT, fontSize: 'clamp(32px, 5vw, 52px)' }}>
          Managed Creators
        </h1>
      </section>

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
          ) : notFound ? (
            <p className="text-white/60 text-center py-16" style={{ fontFamily: FONT }}>This link isn&apos;t active. It may have been removed.</p>
          ) : error ? (
            <p className="text-[#FB7185] text-center py-16" style={{ fontFamily: FONT }}>{error}</p>
          ) : creators.length === 0 ? (
            <p className="text-white/45 text-center py-16" style={{ fontFamily: FONT }}>No creators in this roster yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {creators.map((c) => <CreatorCard key={c.username || c.publicId} c={c} />)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
