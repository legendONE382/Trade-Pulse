import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Receipt,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import useAsyncData from '../hooks/useAsyncData'
import { salesService, expensesService, customersService, debtsService } from '../services'
import { PageHeader, Badge, LoadingSpinner } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/supabaseStorage'

function StatCard({ title, value, icon: Icon, trend, trendValue, color, isCurrency = true }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>
            {isCurrency ? formatCurrency(value) : value}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const loadDashboardData = async () => {
    const [sales, expenses, customers, debts] = await Promise.all([
      salesService.list(),
      expensesService.list(),
      customersService.list(),
      debtsService.list(),
    ])

    const today = new Date().toDateString()

    const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.amount), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
    const todaySales = sales
      .filter(s => new Date(s.date).toDateString() === today)
      .reduce((sum, s) => sum + parseFloat(s.amount), 0)
    const todayExpenses = expenses
      .filter(e => new Date(e.date).toDateString() === today)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
    const pendingDebts = debts
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + parseFloat(d.amount), 0)

    return {
      stats: {
        totalSales,
        totalExpenses,
        totalProfit: totalSales - totalExpenses,
        totalCustomers: customers.length,
        pendingDebts,
        todaySales,
        todayExpenses,
      },
      recentSales: sales.slice(0, 5),
      recentExpenses: expenses.slice(0, 5),
    }
  }

  const { data, loading, error, reload } = useAsyncData(loadDashboardData, [])

  const stats = data?.stats ?? {
    totalSales: 0,
    totalExpenses: 0,
    totalProfit: 0,
    totalCustomers: 0,
    pendingDebts: 0,
    todaySales: 0,
    todayExpenses: 0,
  }
  const recentSales = data?.recentSales ?? []
  const recentExpenses = data?.recentExpenses ?? []

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of your business performance" />
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of your business performance" />
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4 max-w-md">{error}</p>
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your business performance" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={DollarSign}
          color="text-green-600"
          trend="up"
          trendValue={`Today: ${formatCurrency(stats.todaySales)}`}
        />
        <StatCard
          title="Total Expenses"
          value={stats.totalExpenses}
          icon={Receipt}
          color="text-red-600"
          trend="down"
          trendValue={`Today: ${formatCurrency(stats.todayExpenses)}`}
        />
        <StatCard
          title="Net Profit"
          value={stats.totalProfit}
          icon={TrendingUp}
          color={stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="text-blue-600"
          isCurrency={false}
        />
        <StatCard
          title="Pending Debts"
          value={stats.pendingDebts}
          icon={TrendingDown}
          color="text-orange-600"
        />
        <StatCard
          title="Today's Sales"
          value={stats.todaySales}
          icon={ShoppingCart}
          color="text-purple-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <Badge variant="success">{recentSales.length} recent</Badge>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{sale.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                  </div>
                  <p className="font-semibold text-green-600 ml-3 flex-shrink-0">+{formatCurrency(sale.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            <Badge variant="danger">{recentExpenses.length} recent</Badge>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                  </div>
                  <p className="font-semibold text-red-600 ml-3 flex-shrink-0">-{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
