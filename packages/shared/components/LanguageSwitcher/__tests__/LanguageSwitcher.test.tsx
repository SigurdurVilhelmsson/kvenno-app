import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { LanguageSwitcher } from '../LanguageSwitcher';

describe('LanguageSwitcher', () => {
  const defaultProps = {
    language: 'is' as const,
    onLanguageChange: vi.fn(),
  };

  describe('dropdown variant (default)', () => {
    it('renders without crashing with default props', () => {
      const { container } = render(<LanguageSwitcher {...defaultProps} />);

      expect(container.querySelector('select')).not.toBeNull();
    });

    it('renders a select element with current language selected', () => {
      render(<LanguageSwitcher {...defaultProps} />);

      const select = screen.getByRole('combobox', { name: /select language/i });
      expect(select).toBeDefined();
      expect((select as HTMLSelectElement).value).toBe('is');
    });

    it('renders all language options', () => {
      render(<LanguageSwitcher {...defaultProps} />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    it('fires onLanguageChange when a different language is selected', () => {
      const onLanguageChange = vi.fn();
      render(
        <LanguageSwitcher {...defaultProps} onLanguageChange={onLanguageChange} />
      );

      const select = screen.getByRole('combobox', { name: /select language/i });
      fireEvent.change(select, { target: { value: 'en' } });

      expect(onLanguageChange).toHaveBeenCalledWith('en');
    });

    it('has proper aria-label on select', () => {
      render(<LanguageSwitcher {...defaultProps} />);

      const select = screen.getByRole('combobox', { name: /select language/i });
      expect(select.getAttribute('aria-label')).toBe('Select language');
    });

    it('renders only specified available languages', () => {
      render(
        <LanguageSwitcher
          {...defaultProps}
          availableLanguages={['is', 'en']}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
    });
  });

  describe('buttons variant', () => {
    it('renders button elements for each language', () => {
      render(<LanguageSwitcher {...defaultProps} variant="buttons" />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('marks current language button as pressed', () => {
      render(<LanguageSwitcher {...defaultProps} variant="buttons" />);

      const isButton = screen.getByRole('button', { name: /Íslenska/i });
      expect(isButton.getAttribute('aria-pressed')).toBe('true');

      const enButton = screen.getByRole('button', { name: /English/i });
      expect(enButton.getAttribute('aria-pressed')).toBe('false');
    });

    it('fires onLanguageChange when a language button is clicked', () => {
      const onLanguageChange = vi.fn();
      render(
        <LanguageSwitcher
          {...defaultProps}
          variant="buttons"
          onLanguageChange={onLanguageChange}
        />
      );

      const enButton = screen.getByRole('button', { name: /English/i });
      fireEvent.click(enButton);

      expect(onLanguageChange).toHaveBeenCalledWith('en');
    });

    it('has a group role with aria-label', () => {
      render(<LanguageSwitcher {...defaultProps} variant="buttons" />);

      const group = screen.getByRole('group', { name: /language selection/i });
      expect(group).toBeDefined();
    });
  });

  describe('compact variant', () => {
    it('renders compact buttons with flag content', () => {
      render(<LanguageSwitcher {...defaultProps} variant="compact" />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('has proper aria-labels and title attributes', () => {
      render(<LanguageSwitcher {...defaultProps} variant="compact" />);

      const isButton = screen.getByRole('button', { name: /Íslenska/i });
      expect(isButton.getAttribute('title')).toBe('Íslenska');
    });

    it('marks current language as pressed', () => {
      render(
        <LanguageSwitcher
          {...defaultProps}
          language="pl"
          variant="compact"
        />
      );

      const plButton = screen.getByRole('button', { name: /Polski/i });
      expect(plButton.getAttribute('aria-pressed')).toBe('true');

      const isButton = screen.getByRole('button', { name: /Íslenska/i });
      expect(isButton.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('className prop', () => {
    it('applies custom className to the container', () => {
      const { container } = render(
        <LanguageSwitcher {...defaultProps} className="custom-class" />
      );

      expect(container.firstElementChild?.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('showLabels prop', () => {
    it('hides flag label in dropdown when showLabels is false', () => {
      const { container } = render(
        <LanguageSwitcher {...defaultProps} showLabels={false} />
      );

      // The flag span before the select should not be rendered
      const spans = container.querySelectorAll('span');
      expect(spans).toHaveLength(0);
    });
  });
});
