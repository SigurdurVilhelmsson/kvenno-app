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
    render(<Header title="Test Title" />);

    const link = screen.getByRole('link', { name: /Test Title/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/');
  });

  it('renders track navigation tabs', () => {
    render(<Header />);

    const nav = screen.getByRole('navigation', { name: /Svið/i });
    expect(nav).toBeDefined();
    expect(screen.getByRole('link', { name: /Efnafræði/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Íslenskubraut/i })).toBeDefined();
  });

  it('does not render Kennarar link (removed from Header)', () => {
    render(<Header />);

    // Kennarar link was removed from the Header component
    expect(screen.queryByRole('link', { name: /Kennarar/i })).toBeNull();
  });

  it('does not render Upplýsingar when no onInfoClick provided', () => {
    render(<Header />);

    // When onInfoClick is not provided, Upplýsingar is not rendered at all
    expect(screen.queryByText(/Upplýsingar/i)).toBeNull();
  });

  it('renders Upplýsingar as button when onInfoClick is provided', () => {
    const handleClick = () => {};
    render(<Header onInfoClick={handleClick} />);

    const button = screen.getByRole('button', { name: /Upplýsingar/i });
    expect(button).toBeDefined();
  });

  it('renders authSlot when provided', () => {
    render(<Header authSlot={<button data-testid="auth-btn">Login</button>} />);

    expect(screen.getByTestId('auth-btn')).toBeDefined();
  });

  it('uses semantic header element', () => {
    const { container } = render(<Header />);

    const header = container.querySelector('header');
    expect(header).not.toBeNull();
  });

  it('renders game variant with back link', () => {
    render(<Header variant="game" backHref="/efnafraedi/1-ar" gameTitle="Molmassi" />);

    const backLink = screen.getByRole('link', { name: /Til baka/i });
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute('href')).toBe('/efnafraedi/1-ar');
    expect(screen.getByText('Molmassi')).toBeDefined();
  });
});
