import { generateCodeVerifier, generateCodeChallenge, saveCodeVerifier, getAndClearCodeVerifier } from './pkce';

describe('generateCodeVerifier', () => {
  it('restituisce una stringa di 128 caratteri', () => {
    const verifier = generateCodeVerifier();
    expect(typeof verifier).toBe('string');
    expect(verifier).toHaveLength(128);
  });

  it('usa solo caratteri base64url validi (A-Z, a-z, 0-9, -, _)', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('genera valori diversi a ogni chiamata', () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(v1).not.toBe(v2);
  });
});

describe('generateCodeChallenge', () => {
  it('restituisce un hash SHA-256 base64url consistente per lo stesso verifier', async () => {
    const verifier = 'test-verifier-string';
    const challenge1 = await generateCodeChallenge(verifier);
    const challenge2 = await generateCodeChallenge(verifier);
    expect(challenge1).toBe(challenge2);
  });

  it('restituisce un hash diverso per verifier diversi', async () => {
    const c1 = await generateCodeChallenge('verifier-a');
    const c2 = await generateCodeChallenge('verifier-b');
    expect(c1).not.toBe(c2);
  });

  it('il risultato usa solo caratteri base64url (no +, /, =)', async () => {
    const challenge = await generateCodeChallenge(generateCodeVerifier());
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});

describe('saveCodeVerifier e getAndClearCodeVerifier', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('salva e recupera il verifier da sessionStorage', () => {
    saveCodeVerifier('my-verifier');
    expect(sessionStorage.getItem('pkce_code_verifier')).toBe('my-verifier');
  });

  it('getAndClearCodeVerifier ritorna il verifier e lo rimuove', () => {
    saveCodeVerifier('verifier-to-clear');
    const result = getAndClearCodeVerifier();
    expect(result).toBe('verifier-to-clear');
    expect(sessionStorage.getItem('pkce_code_verifier')).toBeNull();
  });

  it('getAndClearCodeVerifier ritorna null se non presente', () => {
    expect(getAndClearCodeVerifier()).toBeNull();
  });
});
