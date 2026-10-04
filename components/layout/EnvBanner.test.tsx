import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { EnvBanner } from './EnvBanner';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('EnvBanner', () => {
  it('renders nothing for the production build (no label)', () => {
    vi.stubEnv('NEXT_PUBLIC_ENV_LABEL', '');
    const { container } = render(<EnvBanner />);
    expect(container.innerHTML).toBe('');
  });

  it('shows the configured rehearsal label', () => {
    vi.stubEnv('NEXT_PUBLIC_ENV_LABEL', 'Public Blockchain Rehearsal · Ethereum Sepolia');
    render(<EnvBanner />);
    expect(screen.getByTestId('env-banner').textContent).toBe('Public Blockchain Rehearsal · Ethereum Sepolia');
  });
});
