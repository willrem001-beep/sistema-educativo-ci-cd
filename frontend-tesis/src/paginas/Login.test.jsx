import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { AuthProvider } from '../autenticacion/AuthContext'

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Login Component', () => {
  it('renderiza el título de Login', () => {
    renderWithRouter(<Login />)
    const titleElement = screen.getByText(/Iniciar Sesión/i)
    expect(titleElement).toBeInTheDocument()
  })

  it('renderiza los inputs de email y contraseña', () => {
    renderWithRouter(<Login />)
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()
  })
})