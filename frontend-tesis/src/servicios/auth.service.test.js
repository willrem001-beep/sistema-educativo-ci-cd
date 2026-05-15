import axios from "axios";
import AuthService from "./auth.service.js";

// Mockeamos axios
vi.mock("axios");

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("login", () => {
    it("debe guardar el usuario en localStorage si el login es exitoso y hay token", async () => {
      const mockData = { token: "fake-token", usuario: { email: "test@test.com", rol: "estudiante" } };
      axios.post.mockResolvedValue({ data: mockData });

      const result = await AuthService.login("test@test.com", "123456");

      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/login"), {
        email: "test@test.com",
        password: "123456",
      });
      expect(result.token).toBe("fake-token");
      expect(localStorage.getItem("user")).toContain("fake-token");
    });

    it("no debe guardar en localStorage si no hay token en la respuesta", async () => {
      const mockData = { message: "Sin token" };
      axios.post.mockResolvedValue({ data: mockData });

      const result = await AuthService.login("test@test.com", "123456");
      expect(result.token).toBeUndefined();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("logout", () => {
    it("debe eliminar el usuario del localStorage", () => {
      localStorage.setItem("user", JSON.stringify({ token: "123" }));
      AuthService.logout();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("register", () => {
    it("debe llamar a axios.post con los datos de registro", async () => {
      axios.post.mockResolvedValue({ data: { message: "Registrado" } });
      await AuthService.register("t@t.com", "123", "Test", "estudiante");
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/register"), {
        email: "t@t.com",
        password: "123",
        nombre_completo: "Test",
        rol: "estudiante",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("debe retornar el usuario si existe en localStorage", () => {
      const user = { email: "test@test.com" };
      localStorage.setItem("user", JSON.stringify(user));
      expect(AuthService.getCurrentUser()).toEqual(user);
    });

    it("debe retornar null si no hay usuario en localStorage", () => {
      expect(AuthService.getCurrentUser()).toBeNull();
    });
  });
});