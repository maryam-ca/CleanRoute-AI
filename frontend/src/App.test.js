import { API_BASE_URL, authHeaders } from './services/api';

describe('API helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('uses the default API base URL when no environment override is set', () => {
    expect(API_BASE_URL).toBe('/api');
  });

  test('returns an authorization header when a token exists', () => {
    localStorage.setItem('access_token', 'sample-token');
    expect(authHeaders()).toEqual({ Authorization: 'Bearer sample-token' });
  });

  test('returns empty headers when the user is signed out', () => {
    expect(authHeaders()).toEqual({});
  });
});
