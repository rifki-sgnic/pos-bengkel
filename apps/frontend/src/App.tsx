import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import { Toaster } from "./components/ui/sonner"
import { DashboardPage } from "./pages/DashboardPage"
import { LoginPage } from "./pages/LoginPage"
import { PosPage } from "./pages/PosPage"
import { ProductsPage } from "./pages/ProductsPage"
import { TransactionsPage } from "./pages/TransactionPage"
import { CategoriesPage } from "./pages/CategoriesPage"
import { ProtectedRoute } from "./routes/ProtectedRoute"
import { PublicRoute } from "./routes/PublicRoute"

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  )
}

export default App
