import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

vi.mock('../dal/user.dal.js', () => ({
  findUserByGoogleId: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock('../config/jwt.config.js', () => ({
  generateAccessToken: vi.fn(() => 'mock-access-token'),
  generateRefreshToken: vi.fn(() => 'mock-refresh-token'),
  verifyRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
}));

import * as userDal from '../dal/user.dal.js';
import * as jwtConfig from '../config/jwt.config.js';
import {
  exchangeCodeForToken,
  refreshAccessToken,
  findOrCreateUser,
  generateAuthCode,
} from '../services/auth.service.js';
import { AUTH_CODE_EXPIRATION_MS, REFRESH_TOKEN_EXPIRATION_MS } from '../constants/auth.constants.js';

const makePkce = (verifier) => ({
  verifier,
  challenge: crypto.createHash('sha256').update(verifier).digest('base64url'),
});

const makeUser = (id = 'user-1') => ({ _id: id, name: 'Test User', email: 'test@example.com', photo: 'photo.jpg' });

beforeEach(() => {
  vi.clearAllMocks();
  // Restore default mock implementations after clearAllMocks
  jwtConfig.generateAccessToken.mockReturnValue('mock-access-token');
  jwtConfig.generateRefreshToken.mockReturnValue('mock-refresh-token');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('exchangeCodeForToken', () => {
  it('INVALID_CODE - codice inesistente', async () => {
    const result = await exchangeCodeForToken('nonexistent-code', 'any-verifier');
    expect(result).toEqual({ error: 'INVALID_CODE' });
  });

  it('CODE_EXPIRED - codice scaduto', async () => {
    const { verifier, challenge } = makePkce('verifier-expired');
    const code = generateAuthCode(makeUser('exp-user'), challenge);

    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + AUTH_CODE_EXPIRATION_MS + 1000);

    const result = await exchangeCodeForToken(code, verifier);
    expect(result).toEqual({ error: 'CODE_EXPIRED' });
  });

  it('PKCE_FAILED - code verifier non corrispondente', async () => {
    const { challenge } = makePkce('correct-verifier');
    const code = generateAuthCode(makeUser('pkce-user'), challenge);

    const result = await exchangeCodeForToken(code, 'wrong-verifier');
    expect(result).toEqual({ error: 'PKCE_FAILED' });
  });

  it('PKCE corretto → ritorna access e refresh token', async () => {
    const { verifier, challenge } = makePkce('valid-verifier');
    const code = generateAuthCode(makeUser('valid-user'), challenge);

    const result = await exchangeCodeForToken(code, verifier);
    expect(result).toEqual({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
  });
});

describe('refreshAccessToken', () => {
  it('INVALID_REFRESH_TOKEN - JWT non valido', async () => {
    jwtConfig.verifyRefreshToken.mockImplementation(() => { throw new Error('jwt malformed'); });

    const result = await refreshAccessToken('bad-token');
    expect(result).toEqual({ error: 'INVALID_REFRESH_TOKEN' });
  });

  it('REFRESH_TOKEN_EXPIRED - TokenExpiredError da verifyRefreshToken', async () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';
    jwtConfig.verifyRefreshToken.mockImplementation(() => { throw err; });

    const result = await refreshAccessToken('expired-jwt');
    expect(result).toEqual({ error: 'REFRESH_TOKEN_EXPIRED' });
  });

  it('INVALID_REFRESH_TOKEN - tokenId non presente nella map', async () => {
    jwtConfig.verifyRefreshToken.mockReturnValue({ sub: 'user-1', tokenId: 'not-in-map' });

    const result = await refreshAccessToken('token-with-unknown-id');
    expect(result).toEqual({ error: 'INVALID_REFRESH_TOKEN' });
  });

  it('REFRESH_TOKEN_EXPIRED - tokenId scaduto nella map', async () => {
    // Capture the tokenId generated internally by generateTokenPair
    let capturedTokenId;
    jwtConfig.generateRefreshToken.mockImplementation((_user, tokenId) => {
      capturedTokenId = tokenId;
      return 'mock-refresh-token-for-expiry';
    });

    // Populate refreshTokens map via a successful exchange
    const { verifier, challenge } = makePkce('verifier-for-expiry-test');
    const code = generateAuthCode(makeUser('expiry-user'), challenge);
    await exchangeCodeForToken(code, verifier);

    // Advance time past REFRESH_TOKEN_EXPIRATION_MS
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + REFRESH_TOKEN_EXPIRATION_MS + 1000);
    jwtConfig.verifyRefreshToken.mockReturnValue({ sub: 'expiry-user', tokenId: capturedTokenId });

    const result = await refreshAccessToken('mock-refresh-token-for-expiry');
    expect(result).toEqual({ error: 'REFRESH_TOKEN_EXPIRED' });
  });

  it('valido → token rotation (nuova coppia di token)', async () => {
    let capturedTokenId;
    jwtConfig.generateRefreshToken.mockImplementation((_user, tokenId) => {
      capturedTokenId = tokenId;
      return 'mock-refresh-token-for-rotation';
    });

    const { verifier, challenge } = makePkce('verifier-for-rotation-test');
    const code = generateAuthCode(makeUser('rotation-user'), challenge);
    await exchangeCodeForToken(code, verifier);

    jwtConfig.verifyRefreshToken.mockReturnValue({ sub: 'rotation-user', tokenId: capturedTokenId });
    userDal.findUserById.mockResolvedValue(makeUser('rotation-user'));
    jwtConfig.generateAccessToken.mockReturnValue('new-access-token');
    jwtConfig.generateRefreshToken.mockReturnValue('new-refresh-token');

    const result = await refreshAccessToken('mock-refresh-token-for-rotation');
    expect(result).toEqual({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' });
  });
});

describe('findOrCreateUser', () => {
  const profile = {
    id: 'google-123',
    displayName: 'Test User',
    emails: [{ value: 'test@example.com' }],
    _json: { picture: 'photo.jpg' },
  };

  it('utente esistente → lo ritorna senza creare', async () => {
    const existing = makeUser('existing-1');
    userDal.findUserByGoogleId.mockResolvedValue(existing);

    const result = await findOrCreateUser(profile);
    expect(result).toBe(existing);
    expect(userDal.createUser).not.toHaveBeenCalled();
  });

  it('utente nuovo → chiama createUser con i dati corretti', async () => {
    const newUser = makeUser('new-1');
    userDal.findUserByGoogleId.mockResolvedValue(null);
    userDal.createUser.mockResolvedValue(newUser);

    const result = await findOrCreateUser(profile);
    expect(userDal.createUser).toHaveBeenCalledWith({
      googleId: 'google-123',
      name: 'Test User',
      email: 'test@example.com',
      photo: 'photo.jpg',
    });
    expect(result).toBe(newUser);
  });
});
