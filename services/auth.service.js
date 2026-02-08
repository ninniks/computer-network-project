import crypto from 'crypto';
import * as userDal from '../dal/user.dal.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt.config.js';
import { AUTH_CODE_EXPIRATION_MS, REFRESH_TOKEN_EXPIRATION_MS } from '../constants/auth.constants.js';

// In-memory store per auth codes (in produzione: Redis)
const authCodes = new Map();

// In-memory store per refresh tokens (in produzione: Redis)
const refreshTokens = new Map();

export const findOrCreateUser = async (profile) => {
  const existingUser = await userDal.findUserByGoogleId(profile.id);

  if (existingUser) {
    return existingUser;
  }

  const userData = {
    googleId: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
    photo: profile._json.picture
  };

  return userDal.createUser(userData);
};

export const generateAuthCode = (user, codeChallenge) => {
  const code = crypto.randomUUID();

  authCodes.set(code, {
    user,
    codeChallenge,
    expiresAt: Date.now() + AUTH_CODE_EXPIRATION_MS
  });

  return code;
};

const generateTokenPair = (user) => {
  const tokenId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, tokenId);

  refreshTokens.set(tokenId, {
    userId: user._id.toString(),
    expiresAt: Date.now() + REFRESH_TOKEN_EXPIRATION_MS
  });

  return { accessToken, refreshToken, tokenId };
};

export const exchangeCodeForToken = async (code, codeVerifier) => {
  const data = authCodes.get(code);

  if (!data) {
    return { error: 'INVALID_CODE' };
  }

  if (Date.now() > data.expiresAt) {
    authCodes.delete(code);
    return { error: 'CODE_EXPIRED' };
  }

  // Verifica PKCE
  const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  if (hash !== data.codeChallenge) {
    return { error: 'PKCE_FAILED' };
  }

  authCodes.delete(code);

  const { accessToken, refreshToken } = generateTokenPair(data.user);
  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { error: 'REFRESH_TOKEN_EXPIRED' };
    }
    return { error: 'INVALID_REFRESH_TOKEN' };
  }

  const tokenData = refreshTokens.get(payload.tokenId);

  if (!tokenData) {
    return { error: 'INVALID_REFRESH_TOKEN' };
  }

  if (Date.now() > tokenData.expiresAt) {
    refreshTokens.delete(payload.tokenId);
    return { error: 'REFRESH_TOKEN_EXPIRED' };
  }

  // Invalida il vecchio refresh token (rotation)
  refreshTokens.delete(payload.tokenId);

  const user = await userDal.findUserById(payload.sub);

  if (!user) {
    return { error: 'USER_NOT_FOUND' };
  }

  // Genera nuova coppia di token
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
  return { accessToken, refreshToken: newRefreshToken };
};

export const invalidateRefreshToken = (refreshToken) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    refreshTokens.delete(payload.tokenId);
    return { success: true };
  } catch {
    return { success: true };
  }
};
