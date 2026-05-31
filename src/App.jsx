import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Expenses from './pages/Expenses'
import Customers from './pages/Customers'
import Debts from './pages/Debts'
import Invoices from './pages/Invoices'
import Reminders from './pages/Reminders'
import Products from './pages/Products'
import Signin from './pages/Signin'
import Signup from './pages/Signup'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute>
                <Layout>
                  <Sales />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <Layout>
                  <Expenses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/debts" element={
              <ProtectedRoute>
                <Layout>
                  <Debts />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reminders" element={
              <ProtectedRoute>
                <Layout>
                  <Reminders />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
