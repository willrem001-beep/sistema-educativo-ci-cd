import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { AuthProvider } from '../autenticacion/AuthContext' 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Login Component', () => {
  it('renderiza el título de Login', () => {
    // ARREGLADO: Envolver Login dentro de AuthProvider
    renderWithRouter(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )
    const titleElement = screen.getByText(/Iniciar Sesión/i)
    expect(titleElement).toBeInTheDocument()
  })

  it('renderiza los inputs de email y contraseña', () => {
    // ARREGLADO: Envolver Login dentro de AuthProvider
    renderWithRouter(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()
  })
})