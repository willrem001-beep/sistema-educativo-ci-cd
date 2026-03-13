export default function authHeader() {
  const userStr = localStorage.getItem("user");
  let user = null;

  if (userStr) {
    user = JSON.parse(userStr);
  }

  if (user && user.token) {
    // Retornamos el header Authorization con el token
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
}