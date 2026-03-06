import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/jwt.config.js', () => ({
  verifyAccessToken: vi.fn(),
}));

import * as jwtConfig from '../config/jwt.config.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const makeReqRes = (authHeader) => {
  const req = { headers: { authorization: authHeader } };
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  const next = vi.fn();
  return { req, res, next };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('requireAuth middleware', () => {
  it('NO_TOKEN - nessun header Authorization', () => {
    const { req, res, next } = makeReqRes(undefined);
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'NO_TOKEN' });
    expect(next).not.toHaveBeenCalled();
  });

  it('NO_TOKEN - header non inizia con Bearer', () => {
    const { req, res, next } = makeReqRes('Basic dXNlcjpwYXNz');
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'NO_TOKEN' });
    expect(next).not.toHaveBeenCalled();
  });

  it('JWT valido → req.user settato e next() chiamato', () => {
    jwtConfig.verifyAccessToken.mockReturnValue({
      sub: 'user-id-1',
      name: 'Test User',
      email: 'test@example.com',
      photo: 'photo.jpg',
    });

    const { req, res, next } = makeReqRes('Bearer valid-token');
    requireAuth(req, res, next);

    expect(req.user).toEqual({
      _id: 'user-id-1',
      name: 'Test User',
      email: 'test@example.com',
      photo: 'photo.jpg',
    });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('TOKEN_EXPIRED - TokenExpiredError da verifyAccessToken', () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';
    jwtConfig.verifyAccessToken.mockImplementation(() => { throw err; });

    const { req, res, next } = makeReqRes('Bearer expired-token');
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'TOKEN_EXPIRED' });
    expect(next).not.toHaveBeenCalled();
  });

  it('INVALID_TOKEN - errore generico da verifyAccessToken', () => {
    jwtConfig.verifyAccessToken.mockImplementation(() => { throw new Error('invalid signature'); });

    const { req, res, next } = makeReqRes('Bearer bad-token');
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'INVALID_TOKEN' });
    expect(next).not.toHaveBeenCalled();
  });
});
