import axios from 'axios';
import { config } from '../config';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  saveCodeVerifier,
  getAndClearCodeVerifier,
} from '../utils/pkce';

let accessToken = null;
let refreshPromise = null;

/**
 * Initiates the OAuth login flow with PKCE
 * Generates code verifier/challenge and redirects to Google OAuth
 */
export async function initiateLogin() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  saveCodeVerifier(codeVerifier);

  const params = new URLSearchParams({
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${config.apiUrl}/auth/google?${params.toString()}`;
}

/**
 * Exchanges the authorization code for tokens
 * @param {string} code - The authorization code from OAuth callback
 * @returns {Promise<Object>} The user data and tokens
 */
export async function exchangeCodeForTokens(code) {
  const codeVerifier = getAndClearCodeVerifier();

  if (!codeVerifier) {
    throw new Error('Code verifier not found. Please try logging in again.');
  }

  const response = await axios.post(
    `${config.apiUrl}/api/v1/auth/token`,
    { code, code_verifier: codeVerifier },
    { withCredentials: true }
  );

  console.log(response);

  accessToken = response.data.accessToken;

  return response.data;
}

/**
 * Refreshes the access token using the refresh token cookie
 * @returns {Promise<Object>} The new token data
 */
export async function refreshToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = axios
    .post(`${config.apiUrl}/api/v1/auth/refresh`, {}, { withCredentials: true })
    .then((response) => {
      accessToken = response.data.accessToken;
      return response.data;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Logs out the user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await axios.post(`${config.apiUrl}/api/v1/auth/logout`, {}, { withCredentials: true });
  } finally {
    accessToken = null;
  }
}

/**
 * Returns the current access token
 * @returns {string|null} The access token or null if not authenticated
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Sets the access token (used after token refresh)
 * @param {string} token - The new access token
 */
export function setAccessToken(token) {
  accessToken = token;
}

/**
 * Clears the access token (used on logout)
 */
export function clearAccessToken() {
  accessToken = null;
}

/**
 * Checks if the user is authenticated
 * @returns {boolean} True if user has an access token
 */
export function isAuthenticated() {
  return accessToken !== null;
}
