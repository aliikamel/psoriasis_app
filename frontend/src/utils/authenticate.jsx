// Saving Authentication tokens in localStorage
export const authenticate = (data) => {
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
};
