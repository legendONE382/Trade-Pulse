import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Expenses from './pages/Expenses'
import Customers from './pages/Customers'
import Debts from './pages/Debts'
import Invoices from './pages/Invoices'
import Reminders from './pages/Reminders'
import Products from './pages/Products'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
