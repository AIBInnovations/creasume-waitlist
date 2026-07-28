import { goToPath } from '../router.js'
import { formatCount } from '../services/influenceApi.js'

// Shared creator card used by both the public "Browse Creators" directory and
// a brand's shareable roster page — same card, two different creator lists.

const FONT = "'Outfit', sans-serif"
const MONO = "'DM Mono', monospace"

// ---- Small inline icons ----
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.5" /></svg>
)
const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 3.5a3 3 0 0 1 0 5.8" /></svg>
)
const ExtIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>
)
const VerifiedTick = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-label="Verified"><circle cx="12" cy="12" r="10" fill="#8B5CF6" /><path d="M7.8 12.4l2.6 2.6 5.4-5.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export default function CreatorCard({ c }) {
  // Cards resolve by username now (see Creator.findByHandle), so the short
  // /<username> link works directly — no publicId suffix needed.
  const cardUrl = `/${encodeURIComponent(c.username || c.publicId)}`
  return (
    <div className="rounded-2xl overflow-hidden border transition-transform hover:-translate-y-1" style={{ background: '#0e0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
      {/* Banner + avatar. The creator's uploaded banner (Edit Profile → Profile
          Banner) covers the gradient when they have one; the gradient is the
          fallback. NOTE: no overflow-hidden here — it would clip the avatar. */}
      <div className="relative h-24" style={{ background: 'linear-gradient(135deg,#3a2a63 0%, #241d3f 55%, #14121e 100%)' }}>
        {c.banner && (
          <img
            src={c.banner}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        )}
        <div className="absolute -bottom-9 left-6">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden border-4" style={{ borderColor: '#0e0e14', background: '#1a1a22' }}>
            {c.avatar
              ? <img src={c.avatar} alt={c.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              : <div className="w-full h-full grid place-items-center text-white/60 text-2xl font-bold" style={{ fontFamily: FONT }}>{(c.name || c.username || '?').charAt(0).toUpperCase()}</div>}
          </div>
        </div>
      </div>

      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-1.5">
          <h3 className="text-white font-bold text-[19px] leading-tight" style={{ fontFamily: FONT }}>{c.name}</h3>
          {c.verified && <VerifiedTick />}
        </div>
        <p className="text-white/45 text-[14px] mt-0.5" style={{ fontFamily: MONO }}>@{c.username}</p>

        {c.location && (
          <p className="mt-3 flex items-center gap-1.5 text-white/55 text-[13px]" style={{ fontFamily: FONT }}>
            <PinIcon /> {c.location}
          </p>
        )}
        {c.niche && (
          <span className="inline-block mt-3 rounded-md px-3 py-1 text-[12px] font-semibold" style={{ fontFamily: FONT, color: '#4ADE80', background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)' }}>
            {c.niche}
          </span>
        )}

        <div className="mt-5 flex items-center gap-10">
          <div>
            <p className="text-white/45 text-[12px] flex items-center gap-1.5" style={{ fontFamily: FONT }}><UsersIcon /> Followers</p>
            <p className="text-white font-bold text-[18px] mt-1" style={{ fontFamily: FONT }}>{formatCount(c.followers) ?? '0'}</p>
          </div>
          {c.startingPrice != null && (
            <div>
              <p className="text-white/45 text-[12px] flex items-center gap-1" style={{ fontFamily: FONT }}>₹ Starting at</p>
              <p className="text-white font-bold text-[18px] mt-1" style={{ fontFamily: FONT }}>₹{Number(c.startingPrice).toLocaleString()}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => goToPath(cardUrl)}
          className="mt-5 w-full rounded-xl py-3 text-[14px] font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors hover:bg-white/10"
          style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          View Card <ExtIcon />
        </button>
      </div>
    </div>
  )
}
