import { Link } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Check,
  ShoppingCart,
  Receipt,
  FileText,
  Bell,
  Package,
  Bot,
  Shield,
} from 'lucide-react'

const features = [
  { icon: ShoppingCart, title: 'Sales Tracking', desc: 'Record every sale in seconds with customer linking.' },
  { icon: Receipt, title: 'Expense Control', desc: 'Categorize spend and see where money goes.' },
  { icon: Users, title: 'Customer Manager', desc: 'Keep every customer and their history in one place.' },
  { icon: Package, title: 'Products & Stock', desc: 'Track inventory levels and low-stock alerts.' },
  { icon: FileText, title: 'Invoices', desc: 'Create and share invoices via WhatsApp instantly.' },
  { icon: Bell, title: 'Reminders', desc: 'Never miss a follow-up or debt collection.' },
]

const steps = [
  { n: '01', title: 'Create your account', desc: 'Get started in minutes — no credit card needed.' },
  { n: '02', title: 'Record business activity', desc: 'Add sales, expenses, customers and products in one place.' },
  { n: '03', title: 'Grow with confidence', desc: 'Use clear profit insights to make better decisions.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — matches Layout.jsx header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TradePulse</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/signin" className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-sm">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-4 py-1.5 text-sm font-medium text-primary-700">
              <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
              Built for shop owners, sellers & service teams
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Take control of your <span className="text-primary-600">business money.</span>
            </h1>
            <p className="text-lg text-gray-600 leading-8 max-w-xl">
              Stop guessing where your money went. TradePulse gives you clear sales, expense, invoice, and profit visibility — without complicated accounting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-3">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/signin" className="btn-secondary inline-flex items-center justify-center text-base px-8 py-3">
                Sign In
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-primary-600" /> No credit card needed</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-primary-600" /> No accounting experience required</span>
            </div>
          </div>

          {/* Preview card — mimics app dashboard card */}
          <div className="relative">
            <div className="card p-0 overflow-hidden">
              <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Dashboard Overview</span>
                </div>
                <span className="text-primary-100 text-sm">Today</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₦1,248,500</p>
                    <p className="text-xs text-primary-600 mt-1">+12% from last month</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Profit</p>
                    <p className="text-2xl font-bold text-primary-600 mt-1">₦382,400</p>
                    <p className="text-xs text-gray-500 mt-1">After expenses</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Walk-in · Domain', amount: '₦5,946.00', color: 'bg-primary-50 text-primary-700' },
                    { label: 'Customer · Invoice #1842', amount: '₦23,100.00', color: 'bg-primary-50 text-primary-700' },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{r.label}</span>
                      <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${r.color}`}>{r.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="card py-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Debts</p>
                <p className="text-lg font-bold text-gray-900 mt-1">₦84,200</p>
              </div>
              <div className="card py-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customers</p>
                <p className="text-lg font-bold text-gray-900 mt-1">142</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — uses same card + icon style as app */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Everything you need in one place</h2>
          <p className="text-gray-600 mt-3">Stop juggling notebooks and spreadsheets. TradePulse keeps it simple.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-700" />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-6">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {steps.map((s) => (
              <div key={s.n} className="rounded-xl bg-gray-50 border border-gray-200 p-6">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">{s.n}</span>
                <h3 className="font-semibold text-gray-900 mt-4">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-6">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="card bg-primary-600 border-primary-600 text-center py-10">
          <div className="max-w-2xl mx-auto">
            <Shield className="w-10 h-10 text-primary-200 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white">Simple enough for every business owner.</h2>
            <p className="text-primary-100 mt-3 leading-7">Powerful enough to keep your finances organized. No complicated accounting knowledge required — just clear records and better decisions.</p>
            <Link to="/signup" className="mt-8 inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer — matches app muted footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">TradePulse</p>
              <p className="text-xs text-gray-500">Track Sales. Manage Expenses. Know Your Profit.</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <Link to="/signup" className="hover:text-gray-900">Features</Link>
            <Link to="/signin" className="hover:text-gray-900">Contact</Link>
            <a href="/privacy-policy" className="hover:text-gray-900">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
