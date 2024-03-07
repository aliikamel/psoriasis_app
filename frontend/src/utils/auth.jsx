export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  return !!token; // Convert token presence to a boolean
};
