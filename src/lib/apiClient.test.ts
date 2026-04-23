import { describe, it, expect, beforeEach } from 'vitest';
import { storeTokens, getStoredTokens, clearTokens } from './apiClient';

describe('apiClient token storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns nulls when nothing is stored', () => {
    const { accessToken, refreshToken } = getStoredTokens();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });

  it('round-trips both tokens through storeTokens -> getStoredTokens', () => {
    storeTokens('access-abc', 'refresh-xyz');
    const { accessToken, refreshToken } = getStoredTokens();
    expect(accessToken).toBe('access-abc');
    expect(refreshToken).toBe('refresh-xyz');
  });

  it('clearTokens wipes both; no stale values remain after logout', () => {
    storeTokens('access-abc', 'refresh-xyz');
    clearTokens();
    const { accessToken, refreshToken } = getStoredTokens();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });
});
