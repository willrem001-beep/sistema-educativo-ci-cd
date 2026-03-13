import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../autenticacion/AuthContext';
import Login from './Login';

// Mock del hook useAuth
jest.mock('../autenticacion/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('renderiza el título de Login', () => {
    renderWithRouter(<Login />);
    const titleElement = screen.getByText(/Iniciar Sesión/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renderiza los inputs de email y contraseña', () => {
    renderWithRouter(<Login />);
    
    
    const emailInput = screen.getByPlaceholderText(/usuario@ejemplo.com/i);
    const passwordInput = screen.getByPlaceholderText(/\*\*\*\*\*\*\*\*/i);
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('el botón de submit está presente', () => {
    renderWithRouter(<Login />);
    const submitButton = screen.getByRole('button', { name: /Ingresar|Cargando.../i });
    expect(submitButton).toBeInTheDocument();
  });
});