const CODE_VERIFIER_KEY = 'pkce_code_verifier';

/**
 * Generates a cryptographically random code verifier for PKCE
 * @returns {string} A random string of 128 characters
 */
export function generateCodeVerifier() {
  const array = new Uint8Array(96);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generates a code challenge from the code verifier using SHA-256
 * @param {string} verifier - The code verifier
 * @returns {Promise<string>} The base64url-encoded SHA-256 hash of the verifier
 */
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Encodes a Uint8Array to base64url format
 * @param {Uint8Array} array - The array to encode
 * @returns {string} The base64url-encoded string
 */
function base64UrlEncode(array) {
  const base64 = btoa(String.fromCharCode(...array));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Saves the code verifier to sessionStorage
 * @param {string} verifier - The code verifier to save
 */
export function saveCodeVerifier(verifier) {
  sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);
}

/**
 * Retrieves and removes the code verifier from sessionStorage
 * @returns {string|null} The code verifier or null if not found
 */
export function getAndClearCodeVerifier() {
  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
  return verifier;
}
