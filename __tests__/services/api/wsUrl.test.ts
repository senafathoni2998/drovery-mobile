import { deriveWsBaseUrl } from '@/services/api/wsUrl';

describe('deriveWsBaseUrl', () => {
  it('maps http + /api/v1 to ws://host:port (prefix dropped)', () => {
    expect(deriveWsBaseUrl('http://192.168.1.7:3000/api/v1')).toBe(
      'ws://192.168.1.7:3000',
    );
  });

  it('maps https to wss and keeps the (implicit) host with no port', () => {
    expect(deriveWsBaseUrl('https://api.drovery.com/api/v1')).toBe(
      'wss://api.drovery.com',
    );
  });

  it('preserves an explicit port on https', () => {
    expect(deriveWsBaseUrl('https://api.drovery.com:8443/api/v1')).toBe(
      'wss://api.drovery.com:8443',
    );
  });

  it('handles a base URL with no path', () => {
    expect(deriveWsBaseUrl('http://localhost:3000')).toBe('ws://localhost:3000');
  });

  it('handles a trailing slash without a prefix', () => {
    expect(deriveWsBaseUrl('http://localhost:3000/')).toBe('ws://localhost:3000');
  });

  it('throws on a non-http(s) / malformed URL', () => {
    expect(() => deriveWsBaseUrl('ftp://x')).toThrow();
    expect(() => deriveWsBaseUrl('garbage')).toThrow();
    expect(() => deriveWsBaseUrl('')).toThrow();
  });
});
