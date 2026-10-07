import { motion } from 'framer-motion'
import Logo from '../../components/ui/Logo'

const highlights = [
  ['Live prices', 'Refreshed every 20 seconds, straight from the cache.'],
  ['Precise targets', 'Above or below — alert on the exact price you care about.'],
  ['Instant signals', 'See the moment a threshold is hit, and get emailed too.'],
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block"
      >
        <Logo />
        <h1 className="mt-14 max-w-md text-5xl leading-[1.05] font-semibold tracking-tight text-balance">
          Never miss the <span className="text-lime">move</span>.
        </h1>
        <p className="text-ink-300 mt-5 max-w-md text-lg">
          Set a target for any coin and watch it live. Tickr tells you when the market
          gets there.
        </p>
        <ul className="mt-10 space-y-5">
          {highlights.map(([heading, copy], i) => (
            <motion.li
              key={heading}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.12 }}
              className="flex gap-4"
            >
              <span className="bg-lime mt-1 size-2 shrink-0 rounded-full shadow-[0_0_12px_rgb(198_242_78/0.8)]" />
              <span>
                <span className="block font-medium">{heading}</span>
                <span className="text-ink-400">{copy}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="border-ink-700 bg-ink-900/80 w-full rounded-3xl border p-8 shadow-2xl backdrop-blur sm:p-10"
      >
        <Logo className="mb-8 lg:hidden" />
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-ink-400 mt-1.5">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="text-ink-400 mt-8 text-center text-sm">{footer}</p>
      </motion.section>
    </main>
  )
}
