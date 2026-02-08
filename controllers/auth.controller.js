import * as authService from '../services/auth.service.js';
import { REFRESH_TOKEN_EXPIRATION_MS } from '../constants/auth.constants.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: REFRESH_TOKEN_EXPIRATION_MS,
  path: '/api/v1/auth'
};

export const getCurrentUser = (req, res) => {
  res.json(req.user);
};

export const tokenExchange = async (req, res) => {
  const { code, code_verifier } = req.body;

  if (!code || !code_verifier) {
    return res.status(400).json({ error: 'MISSING_PARAMS' });
  }

  const result = await authService.exchangeCodeForToken(code, code_verifier);

  if (result.error) {
    return res.status(401).json({ error: result.error });
  }

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken: result.accessToken });
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
  }

  const result = await authService.refreshAccessToken(refreshToken);

  if (result.error) {
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return res.status(401).json({ error: result.error });
  }

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken: result.accessToken });
};

export const logout = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    authService.invalidateRefreshToken(refreshToken);
  }

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.json({ success: true });
};
