const isProduction = window.location.href.includes("localhost");

export const baseUrl = isProduction ? "http://localhost:3001" : "http://aws-app.eu-north-1.elasticbeanstalk.com";