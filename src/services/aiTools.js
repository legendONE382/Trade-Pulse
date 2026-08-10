import { salesService } from './salesService'
import { expensesService } from './expensesService'
import { productsService } from './productsService'
import { customersService } from './customersService'
import { debtsService } from './debtsService'
import { orderService } from './orderService'
import { formatCurrency } from '../utils/supabaseStorage'

export const aiTools = [
  {
    name: 'get_sales_summary',
    description: 'Get a summary of sales for a given time period. Returns total sales, count, and average.',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', 'week', 'month', 'year', 'all'], description: 'Time period for sales summary' }
      }
    },
    execute: async () => {
      const sales = await salesService.list()
      if (sales.length === 0) return { total: 0, count: 0, average: 0, message: 'No sales recorded yet.' }
      
      const total = sales.reduce((sum, s) => sum + parseFloat(s.amount), 0)
      return {
        total,
        count: sales.length,
        average: total / sales.length,
        formatted_total: formatCurrency(total),
        formatted_average: formatCurrency(total / sales.length),
      }
    }
  },
  {
    name: 'get_expenses_summary',
    description: 'Get a summary of expenses. Returns total expenses, count, and breakdown by category.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const expenses = await expensesService.list()
      if (expenses.length === 0) return { total: 0, count: 0, categories: {}, message: 'No expenses recorded yet.' }
      const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      const categories = {}
      expenses.forEach(e => {
        const cat = e.category || 'Uncategorized'
        categories[cat] = (categories[cat] || 0) + parseFloat(e.amount)
      })
      return { total, count: expenses.length, categories, formatted_total: formatCurrency(total) }
    }
  },
  {
    name: 'get_profit',
    description: 'Calculate profit (sales minus expenses) for the business.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const sales = await salesService.list()
      const expenses = await expensesService.list()
      const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.amount), 0)
      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      return {
        revenue: totalSales,
        expenses: totalExpenses,
        profit: totalSales - totalExpenses,
        margin: totalSales > 0 ? ((totalSales - totalExpenses) / totalSales * 100).toFixed(1) : '0',
        formatted_revenue: formatCurrency(totalSales),
        formatted_expenses: formatCurrency(totalExpenses),
        formatted_profit: formatCurrency(totalSales - totalExpenses),
      }
    }
  },
  {
    name: 'get_low_stock_products',
    description: 'Get products that are low on stock or out of stock.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const products = await productsService.list()
      const lowStock = products.filter(p => p.stock <= p.min_stock)
      return {
        count: lowStock.length,
        products: lowStock.map(p => ({ name: p.name, stock: p.stock, min_stock: p.min_stock })),
        message: lowStock.length === 0 ? 'All products are well stocked.' : `${lowStock.length} product(s) need restocking.`
      }
    }
  },
  {
    name: 'get_customers_summary',
    description: 'Get customer statistics and recent customer activity.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const customers = await customersService.list()
      return { total_customers: customers.length, message: `You have ${customers.length} customer(s) in your database.` }
    }
  },
  {
    name: 'get_pending_debts',
    description: 'Get all pending debts/credits owed by customers.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const debts = await debtsService.list()
      const pending = debts.filter(d => d.status === 'pending')
      const total = pending.reduce((sum, d) => sum + parseFloat(d.amount), 0)
      return {
        count: pending.length,
        total,
        formatted_total: formatCurrency(total),
        debts: pending.map(d => ({ amount: d.amount, description: d.description, customer_id: d.customer_id })),
      }
    }
  },
  {
    name: 'get_recent_orders',
    description: 'Get recent orders with their status and totals.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const orders = await orderService.list()
      return {
        count: orders.length,
        orders: orders.slice(0, 5).map(o => ({
          id: o.id.slice(-6).toUpperCase(),
          total: o.total,
          status: o.status,
          payment_status: o.payment_status,
        })),
      }
    }
  },
  {
    name: 'get_top_products',
    description: 'Get the most profitable products based on price and stock.',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const products = await productsService.list()
      const sorted = [...products].sort((a, b) => (b.price - b.cost) - (a.price - a.cost))
      return {
        products: sorted.slice(0, 5).map(p => ({
          name: p.name,
          price: p.price,
          cost: p.cost || 0,
          margin: p.cost ? ((p.price - p.cost) / p.price * 100).toFixed(1) + '%' : 'N/A',
          stock: p.stock,
        })),
      }
    }
  },
]

export const getToolByName = (name) => aiTools.find(t => t.name === name)

export const getToolDefinitions = () => aiTools.map(t => ({
  type: 'function',
  function: {
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }
}))
