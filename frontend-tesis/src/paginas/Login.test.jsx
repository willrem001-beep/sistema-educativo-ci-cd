import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "../autenticacion/AuthContext";
import { vi } from 'vitest';

// Mockeamos el hook useAuth
vi.mock("../autenticacion/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mockeamos useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Wrapper con Router
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: vi.fn() });
  });

  it("renderiza el título de Login", () => {
    renderLogin();
    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
  });

  it("renderiza los inputs de email y contraseña", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("usuario@ejemplo.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
  });

  it("maneja el login exitoso y navega al dashboard", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({ login: mockLogin });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("usuario@ejemplo.com"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("********"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    // Verifica el estado de carga (Líneas 47-62 del componente original)
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@test.com", "123456");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("muestra un mensaje de error si el login falla", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: false, message: "Credenciales inválidas" });
    useAuth.mockReturnValue({ login: mockLogin });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("usuario@ejemplo.com"), { target: { value: "bad@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("********"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});