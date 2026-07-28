import { motion } from 'framer-motion'
import { formatCount } from '../services/influenceApi.js'
import { goToPath } from '../router.js'

const PLACEHOLDERS = Array.from({ length: 6 })
// Below this many real creators there isn't enough content to loop — show a
// static row instead of an auto-scrolling marquee.
const MARQUEE_MIN = 2

function FoundingCheck({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" aria-label="Verified creator" role="img" className={className}>
      <circle cx="12" cy="12" r="10" fill="#3B82F6" />
      <path
        d="M7.8 12.4l2.6 2.6 5.4-5.8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CreatorPlaceholder() {
  return (
    <div className="shrink-0 w-52 md:w-72 h-96 md:h-120 rounded-3xl mx-3 overflow-hidden border border-white/8 bg-white/5 animate-pulse">
      <div className="h-full bg-linear-to-b from-white/4 to-white/10" />
    </div>
  )
}

function CreatorCard({ creator, layout = 'marquee' }) {
  const username = creator.username || String(creator.handle || '').replace(/^@+/, '')
  const name = creator.name || username
  const score = Number.isFinite(Number(creator.score)) ? Math.round(Number(creator.score)) : null
  const followers = formatCount(creator.followers)
  // The real card now lives at the short /<username> (cards resolve by
  // username/slug/publicId — see Creator.findByHandle). `publicId` presence
  // here just means "this is a real signed-up creator" — fall back to the
  // live on-the-fly preview when they have no linked account yet.
  const href = creator.publicId
    ? `/${encodeURIComponent(username)}`
    : `/preview?lookup=${encodeURIComponent(username)}`

  // Marquee cards need a fixed width + side margin (they sit in a horizontally
  // scrolling track). Grid cards (the 1-2 creator static layout) instead fill
  // their grid cell — a fixed width would force 2 cards wider than the phone
  // screen and push them onto separate rows instead of sitting side by side.
  const sizeClass =
    layout === 'grid' ? 'w-full h-88 md:h-120' : 'w-52 md:w-72 h-96 md:h-120 mx-3'

  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        goToPath(href)
      }}
      aria-label={`Open ${name}'s dynamic media kit`}
      className={`group relative shrink-0 ${sizeClass} rounded-3xl overflow-hidden border border-white/12 bg-[#12131a] text-white no-underline shadow-[0_18px_50px_rgba(0,0,0,.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d96ff]`}
    >
      {creator.profilePicture ? (
        <img
          src={creator.profilePicture}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-[#36377a] to-[#111225] text-7xl font-semibold text-white/70">
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-b from-black/55 via-transparent to-black/85" />

      <div
        className={
          creator.isFoundingCreator
            ? 'absolute left-2.5 top-2.5 inline-flex w-fit max-w-[70%] rounded-full px-3 py-1'
            : 'absolute left-2.5 top-2.5 inline-flex w-fit max-w-[70%] rounded-full border border-white/25 bg-black/50 px-3 py-1 backdrop-blur-md'
        }
        style={
          creator.isFoundingCreator
            ? {
                background:
                  'linear-gradient(180deg, #2a1d07 0%, #150e03 100%) padding-box, ' +
                  'linear-gradient(160deg, #FBE7A0 0%, #D8A93C 46%, #9A701F 100%) border-box',
                border: '1.5px solid transparent',
              }
            : undefined
        }
      >
        <span
          className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-normal"
          style={{ color: creator.isFoundingCreator ? '#F6E3A8' : '#fff' }}
        >
          {creator.isFoundingCreator ? 'Founding Creator' : 'Meet Our Creator'}
        </span>
      </div>

      {score != null && (
        <div className="absolute right-3 top-3 flex h-11 w-11 flex-col items-center justify-center rounded-full border border-white/25 bg-black/50 leading-none backdrop-blur-md">
          <strong className="text-sm">{score}</strong>
          <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[.08em] text-white/70">Score</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-lg md:text-xl font-bold">{name}</p>
          {creator.isFoundingCreator && (
            <FoundingCheck className="h-4 w-4 md:h-5 md:w-5 shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,.45)]" />
          )}
        </div>
        <div className="mt-1 flex flex-col md:flex-row md:items-center gap-x-2 text-xs md:text-sm text-white/80">
          <span className="truncate">@{username}</span>
          {followers && (
            <>
              <span aria-hidden="true" className="hidden md:inline">•</span>
              <span className="truncate">{followers} followers</span>
            </>
          )}
        </div>
        {creator.quote && (
          <p className="mt-2 text-[11px] md:text-xs leading-snug italic text-white/70">"{creator.quote}"</p>
        )}
      </div>
    </a>
  )
}

export default function Testimonials({ items = [] }) {
  const hasCreators = items.length > 0
  const cards = hasCreators ? items : PLACEHOLDERS
  // Placeholders always loop (there are 6, plenty to scroll). Real creators
  // only loop once there are enough to make a scroll feel continuous —
  // otherwise a static row reads better than a slow 2-card loop.
  const useMarquee = !hasCreators || items.length >= MARQUEE_MIN

  const row = (hidden) => (
    <div className="flex shrink-0" aria-hidden={hidden}>
      {cards.map((creator, index) => (
        hasCreators
          ? <CreatorCard key={creator._id || creator.username || index} creator={creator} />
          : <CreatorPlaceholder key={index} />
      ))}
    </div>
  )

  return (
    <section className="relative z-10 overflow-hidden py-16 md:py-24">
      <div className="relative z-10 mb-12 px-6 text-center md:mb-16">
        <h2 className="mb-4 text-4xl font-bold md:text-5xl">Meet Our Creator</h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
          Discover the creators building their professional identity with Creasume.
        </p>
      </div>

      {useMarquee ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="lp-marquee-group flex w-full overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
            maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
          }}
        >
          <div className="lp-marquee" style={{ animationDuration: '24s' }}>
            {row(undefined)}
            {row(true)}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`grid ${items.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-1 md:gap-6 justify-items-stretch max-w-md md:max-w-3xl mx-auto px-1`}
        >
          {items.map((creator, index) => (
            <CreatorCard key={creator._id || creator.username || index} creator={creator} layout="grid" />
          ))}
        </motion.div>
      )}
    </section>
  )
}
