const isProduction = window.location.href.includes("localhost");

export const baseUrl = isProduction ? "http://localhost:3001" : "https://social-link-cghp.onrender.com";
