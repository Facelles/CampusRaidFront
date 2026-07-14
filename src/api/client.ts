import axios from 'axios';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Connect directly to the production Render backend
  return 'https://campusraidbackend-1.onrender.com/api';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for auth token (if needed later)
apiClient.interceptors.request.use((config) => {
  // Add token here if needed
  return config;
});

export default apiClient;
