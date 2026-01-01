// Environment configuration for development
export const environment = {
  production: false,
  // Update this URL to match your Spring Boot backend
  apiUrl: 'http://localhost:8080/api'
};

// For production, create environment.prod.ts with:
// export const environment = {
//   production: true,
//   apiUrl: 'https://your-production-api.com/api'
// };