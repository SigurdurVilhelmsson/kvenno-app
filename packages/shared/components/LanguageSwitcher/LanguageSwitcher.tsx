import type { Language } from '../../hooks/useGameI18n';

export interface LanguageSwitcherProps {
  /** Current language */
  language: Language;
  /** Callback when language changes */
  onLanguageChange: (language: Language) => void;
  /** Available languages (defaults to all) */
  availableLanguages?: readonly Language[];
  /** Visual variant */
  variant?: 'dropdown' | 'buttons' | 'compact';
  /** Additional CSS classes */
  className?: string;
  /** Show language labels */
  showLabels?: boolean;
}

const languageNames: Record<Language, string> = {
  is: 'Íslenska',
  en: 'English',
  pl: 'Polski',
};

const languageFlags: Record<Language, string> = {
  is: '🇮🇸',
  en: '🇬🇧',
  pl: '🇵🇱',
};

/**
 * Language switcher component
 *
 * @example
 * // Dropdown variant (default)
 * <LanguageSwitcher
 *   language={language}
 *   onLanguageChange={setLanguage}
 * />
 *
 * @example
 * // Button variant
 * <LanguageSwitcher
 *   language={language}
 *   onLanguageChange={setLanguage}
 *   variant="buttons"
 * />
 *
 * @example
 * // Compact (flags only)
 * <LanguageSwitcher
 *   language={language}
 *   onLanguageChange={setLanguage}
 *   variant="compact"
 * />
 */
export function LanguageSwitcher({
  language,
  onLanguageChange,
  availableLanguages = ['is', 'en', 'pl'],
  variant = 'dropdown',
  className = '',
  showLabels = true,
}: LanguageSwitcherProps) {
  if (variant === 'dropdown') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabels && (
          <span className="text-sm text-gray-600">{languageFlags[language]}</span>
        )}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          aria-label="Select language"
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {languageFlags[lang]} {languageNames[lang]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1 ${className}`} role="group" aria-label="Language selection">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              language === lang
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={language === lang}
            aria-label={languageNames[lang]}
          >
            {languageFlags[lang]} {showLabels && languageNames[lang]}
          </button>
        ))}
      </div>
    );
  }

  // Compact variant - flags only
  return (
    <div className={`flex items-center gap-0.5 ${className}`} role="group" aria-label="Language selection">
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`p-1.5 text-lg rounded transition-all ${
            language === lang
              ? 'bg-blue-100 scale-110'
              : 'hover:bg-gray-100 opacity-60 hover:opacity-100'
          }`}
          aria-pressed={language === lang}
          aria-label={languageNames[lang]}
          title={languageNames[lang]}
        >
          {languageFlags[lang]}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
