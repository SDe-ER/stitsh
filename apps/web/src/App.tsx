import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppRouter from './router'

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster
        position="top-left"
        richColors
        rtl
        toastOptions={{
          style: {
            fontFamily: 'Cairo, sans-serif',
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App
