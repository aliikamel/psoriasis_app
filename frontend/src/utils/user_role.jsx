// Fetch user role from local storage or return false
export const user_role = () => {
  const role = localStorage.getItem("userRole");
  return (role ? role : false)
};
