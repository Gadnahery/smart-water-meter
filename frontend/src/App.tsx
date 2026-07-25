import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppRouter } from '@/routes/AppRouter'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
