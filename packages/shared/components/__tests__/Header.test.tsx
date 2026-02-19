import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Header } from '../Header';

describe('Header', () => {
  it('renders with default title', () => {
    render(<Header />);

    const link = screen.getByRole('link', { name: /Námsvefur Kvennó/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/');
  });

  it('renders with custom title', () => {
    render(<Header title="Efnafræði" />);

    expect(screen.getByText('Efnafræði')).toBeDefined();
  });

  it('renders Kennarar link', () => {
    render(<Header />);

    const kennarar = screen.getByRole('link', { name: /Kennarar/i });
    expect(kennarar).toBeDefined();
    expect(kennarar.getAttribute('href')).toBe('/admin');
  });

  it('renders Upplýsingar as link when no onInfoClick provided', () => {
    render(<Header />);

    const info = screen.getByRole('link', { name: /Upplýsingar/i });
    expect(info).toBeDefined();
    expect(info.getAttribute('href')).toBe('/info');
  });

  it('renders Upplýsingar as button when onInfoClick is provided', () => {
    const handleClick = () => {};
    render(<Header onInfoClick={handleClick} />);

    const button = screen.getByRole('button', { name: /Upplýsingar/i });
    expect(button).toBeDefined();
  });

  it('renders authSlot when provided', () => {
    render(
      <Header authSlot={<button data-testid="auth-btn">Login</button>} />
    );

    expect(screen.getByTestId('auth-btn')).toBeDefined();
  });

  it('uses semantic header element', () => {
    const { container } = render(<Header />);

    const header = container.querySelector('header');
    expect(header).not.toBeNull();
  });
});
