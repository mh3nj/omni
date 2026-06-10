import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

interface LanguageSwitcherProps {
  onLanguageChange?: (langCode: string) => void;
}

export default function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];
  const currentIndex = languages.findIndex((l) => l.code === i18n.language);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string, dir: string) => {
    i18n.changeLanguage(langCode);
    document.documentElement.dir = dir;
    document.documentElement.lang = langCode;
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
  };

  const nextLanguage = () => {
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLang = languages[nextIndex];
    changeLanguage(nextLang.code, nextLang.dir);
  };

  const prevLanguage = () => {
    const prevIndex = (currentIndex - 1 + languages.length) % languages.length;
    const prevLang = languages[prevIndex];
    changeLanguage(prevLang.code, prevLang.dir);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (diff > 50) nextLanguage();
    if (diff < -50) prevLanguage();
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Desktop dropdown
  if (!isMobile) {
    return (
      <div className='relative' ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition'
        >
          <span>{currentLang.flag}</span>
          <span>{currentLang.name}</span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs`}></i>
        </button>

        {isOpen && (
          <div className='absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50'>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code, lang.dir)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                  i18n.language === lang.code
                    ? 'bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mobile slider
  return (
    <div className='w-full'>
      <div
        className='relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-grab active:cursor-grabbing transition-all'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className='flex flex-col items-center justify-center py-4 px-4'>
          <span className='text-5xl mb-2 drop-shadow-sm'>{currentLang.flag}</span>
          <span className='font-semibold text-gray-800 dark:text-gray-200 text-lg'>
            {currentLang.name}
          </span>
          <span className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-2'>
            <i className='fas fa-arrows-alt-h text-[10px]'></i>
            Swipe to change language
          </span>
        </div>
      </div>

      <div className='flex justify-center gap-2 mt-3'>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code, lang.dir)}
            className={`transition-all duration-200 ${
              i18n.language === lang.code
                ? 'w-8 h-1.5 bg-primary-500 rounded-full'
                : 'w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Switch to ${lang.name}`}
          />
        ))}
      </div>
    </div>
  );
}