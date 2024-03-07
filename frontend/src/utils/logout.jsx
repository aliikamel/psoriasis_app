export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  // Redirect to login page or update the state to reflect the logout
};
