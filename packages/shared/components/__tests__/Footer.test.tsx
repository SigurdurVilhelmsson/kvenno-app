import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders copyright text with current year', () => {
    render(<Footer />);

    const year = new Date().getFullYear().toString();
    const footerText = screen.getByText(new RegExp(year));
    expect(footerText).toBeDefined();
  });

  it('includes school name', () => {
    render(<Footer />);

    expect(screen.getByText(/Kvennaskólinn í Reykjavík/i)).toBeDefined();
  });

  it('renders department when provided', () => {
    const { container } = render(<Footer department="Efnafræðideild" />);

    const text = container.textContent || '';
    expect(text).toContain('Efnafræðideild');
  });

  it('does not render department separator when department is not provided', () => {
    const { container } = render(<Footer />);

    const text = container.textContent || '';
    // The em-dash separator should NOT be present without department
    expect(text.includes(' \u2014 ')).toBe(false);
  });

  it('renders department with em-dash separator', () => {
    const { container } = render(<Footer department="Efnafræðideild" />);

    const text = container.textContent || '';
    expect(text).toContain('\u2014');
    expect(text).toContain('Efnafræðideild');
  });

  it('uses semantic footer element', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
  });
});
