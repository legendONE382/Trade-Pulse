import { Link } from 'react-router-dom'
import heroImage from '../../image.png'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <span className="text-xl font-bold">₦</span>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">TradePulse</p>
            <p className="text-xs text-slate-400">Built for confident business owners</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-slate-300">
          <Link to="/signin" className="hover:text-white transition">Sign In</Link>
          <Link to="/signup" className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-white transition hover:border-emerald-400 hover:text-emerald-200">
            Start Free
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-16 px-6 pb-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-8">
          <div className="space-y-4 max-w-2xl">
            <p className="inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
              Built for shop owners, sellers, and service teams
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Take control of your business money.
            </h1>
            <p className="text-lg leading-8 text-slate-300">
              Stop guessing where your money went. TradePulse gives you clear sales, expense, invoice, and profit visibility without complicated accounting.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Start Free
            </Link>
            <span className="text-sm text-slate-400">
              No accounting experience required. No credit card needed.
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Real profit</p>
              <p className="mt-3 text-3xl font-semibold text-white">Know what you actually earn.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Customer money</p>
              <p className="mt-3 text-3xl font-semibold text-white">Never lose track of who owes you.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300 shadow-xl shadow-slate-950/40">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Trusted by growing businesses</p>
            <p className="mt-4 text-lg leading-8">
              Whether you run a shop, sell online, offer local services, or manage day-to-day customers, TradePulse keeps your money organized and decisions simple.
            </p>
          </div>
        </section>

        <section className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-[2rem] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
            <img src={heroImage} alt="TradePulse dashboard screenshot" className="h-full w-full object-cover" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-slate-300 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Business owner outcome</p>
              <p className="mt-3 text-lg font-semibold text-white">See real profit in seconds.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-slate-300 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Built to move fast</p>
              <p className="mt-3 text-lg font-semibold text-white">Add sales and expenses in under a minute.</p>
            </div>
          </div>
        </section>
      </main>

      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/20">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">The problem</p>
              <h2 className="text-3xl font-semibold text-white">Running a business is hard enough.</h2>
              <p className="text-slate-400 leading-8">
                When records are spread across notebooks, receipts, and spreadsheets, it becomes impossible to know which customers still owe you, what you really earned, or where your cash went.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-5 text-slate-200">
                <p className="font-semibold text-white">Forget who owes money</p>
                <p className="mt-2 text-sm text-slate-400">Stop chasing debts without a clear list.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 text-slate-200">
                <p className="font-semibold text-white">Lose track of expenses</p>
                <p className="mt-2 text-sm text-slate-400">Avoid surprise costs that eat into profit.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 text-slate-200">
                <p className="font-semibold text-white">Confusing profit numbers</p>
                <p className="mt-2 text-sm text-slate-400">See a clear picture of what you really make.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 text-slate-200">
                <p className="font-semibold text-white">Wasting time on wrong tools</p>
                <p className="mt-2 text-sm text-slate-400">Use one simple app instead of many messy spreadsheets.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">How it works</p>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-xl font-semibold text-white">1. Create your account</p>
                <p className="mt-2 text-slate-400">Get started in minutes and start tracking money right away.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-xl font-semibold text-white">2. Record business activity</p>
                <p className="mt-2 text-slate-400">Add sales, expenses, customers, invoices, and receipts in one place.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-xl font-semibold text-white">3. Grow with confidence</p>
                <p className="mt-2 text-slate-400">Use clear profit and customer insights to make better decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/20 sm:grid-cols-3">
          {[
            'Shop Owners',
            'Online Sellers',
            'Service Businesses',
            'Freelancers',
            'Food Vendors',
            'POS Agents',
          ].map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/85 p-5 text-slate-200">
              <p className="text-sm text-emerald-300">Built for</p>
              <p className="mt-3 text-lg font-semibold text-white">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 text-center shadow-2xl shadow-black/25">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Why TradePulse</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Simple enough for every business owner.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Powerful enough to keep your finances organized. No complicated accounting knowledge required.
            Just clear records and better decisions.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            Start Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950/90 px-6 py-8 text-slate-400 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">TradePulse</p>
            <p className="mt-2 text-sm">Track Sales. Manage Expenses. Know Your Profit.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <Link to="/signup" className="transition hover:text-white">Features</Link>
            <Link to="/signin" className="transition hover:text-white">Contact</Link>
            <a href="/privacy-policy" className="transition hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
