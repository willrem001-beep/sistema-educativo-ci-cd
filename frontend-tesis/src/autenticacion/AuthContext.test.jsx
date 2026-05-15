import React from "react";
import { render, renderHook, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import AuthService from "../servicios/auth.service.js";

// Mockeamos el servicio
vi.mock("../servicios/auth.service.js");

const TestComponent = () => {
  const { user, login, logout, register, isEstudiante, isDocente, isAdmin, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.rol : "Sin usuario"}</div>
      <button onClick={() => login("t@t.com", "123")}>Login</button>
      <button onClick={() => login("error", "123")}>Login Error</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => register("t@t.com", "123", "Test", "estudiante")}>Register</button>
      <button onClick={() => register("error", "123", "Test", "estudiante")}>Register Error</button>
      <div>{isEstudiante() ? "Es Estudiante" : "No Estudiante"}</div>
      <div>{isDocente() ? "Es Docente" : "No Docente"}</div>
      <div>{isAdmin() ? "Es Admin" : "No Admin"}</div>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("carga el usuario inicial desde localStorage", async () => {
    AuthService.getCurrentUser.mockReturnValue({ rol: "docente" });
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("docente");
    });
  });

  it("maneja el error al cargar el usuario inicial", async () => {
    AuthService.getCurrentUser.mockImplementation(() => { throw new Error("Error"); });
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("Sin usuario");
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  it("realiza el login exitosamente", async () => {
    AuthService.login.mockResolvedValue({ token: "123", rol: "estudiante" });
    render(<AuthProvider><TestComponent /></AuthProvider>);
    
    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("estudiante");
    });
  });

  it("maneja el error en login", async () => {
    AuthService.login.mockRejectedValue({ 
      response: { data: { error: "Credenciales incorrectas" } } 
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    let res;
    await act(async () => {
      res = await result.current.login("error", "123");
    });
    
    expect(res.success).toBe(false);
    expect(res.message).toBe("Credenciales incorrectas");
  });

  it("usa mensaje de error por defecto en login cuando no hay response", async () => {
    AuthService.login.mockRejectedValue(new Error("Network error"));
    
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    let res;
    await act(async () => {
      res = await result.current.login("test@test.com", "123");
    });
    
    expect(res.success).toBe(false);
    expect(res.message).toBe("Error al iniciar sesión");
  });

  it("realiza el logout correctamente", async () => {
    AuthService.getCurrentUser.mockReturnValue({ rol: "admin" });
    AuthService.logout.mockImplementation(() => localStorage.removeItem("user"));
    render(<AuthProvider><TestComponent /></AuthProvider>);
    
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("admin"));
    
    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("Sin usuario");
  });

  it("verifica los roles correctamente", async () => {
    AuthService.getCurrentUser.mockReturnValue({ rol: "administrador" });
    render(<AuthProvider><TestComponent /></AuthProvider>);
    
    await waitFor(() => {
      expect(screen.getByText("Es Admin")).toBeInTheDocument();
      expect(screen.getByText("No Estudiante")).toBeInTheDocument();
      expect(screen.getByText("No Docente")).toBeInTheDocument();
    });
  });

  it("registra un usuario exitosamente", async () => {
    AuthService.register.mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    let res;
    await act(async () => {
      res = await result.current.register("nuevo@test.com", "123456", "Nuevo Usuario", "estudiante");
    });
    
    expect(res.success).toBe(true);
    expect(AuthService.register).toHaveBeenCalledWith(
      "nuevo@test.com",
      "123456",
      "Nuevo Usuario",
      "estudiante"
    );
  });

  it("maneja el error en registro", async () => {
    AuthService.register.mockRejectedValue({ 
      response: { data: { error: "Email ya registrado" } } 
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    let res;
    await act(async () => {
      res = await result.current.register("existente@test.com", "123456", "Test", "estudiante");
    });
    
    expect(res.success).toBe(false);
    expect(res.message).toBe("Email ya registrado");
  });

  it("usa mensaje de error por defecto en registro cuando no hay response", async () => {
    AuthService.register.mockRejectedValue(new Error("Network error"));
    
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    let res;
    await act(async () => {
      res = await result.current.register("test@test.com", "123456", "Test", "estudiante");
    });
    
    expect(res.success).toBe(false);
    expect(res.message).toBe("Error al registrar usuario");
  });

  it("lanza error si useAuth se usa fuera del Provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow("useAuth debe ser usado dentro de un AuthProvider");
    spy.mockRestore();
  });
});