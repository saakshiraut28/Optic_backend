/** @format */

const axios = require("axios");

const tapestry = axios.create({
  baseURL: "https://api.usetapestry.dev/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Automatically inject apiKey + namespace into every request
tapestry.interceptors.request.use((config) => {
  config.params = {
    apiKey: process.env.TAPESTRY_API_KEY,
    ...config.params,
  };
  return config;
});

module.exports = tapestry;
