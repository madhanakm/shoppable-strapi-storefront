import React from 'react';
import { useTranslation, LANGUAGES } from './TranslationProvider';

interface TranslatedTextProps {
  textKey: string;
  className?: string;
}

// Component to display translated text with proper font styling
const TranslatedText: React.FC<TranslatedTextProps> = ({ textKey, className = '' }) => {
  const { translate, language } = useTranslation();
  
  const isTamil = language === LANGUAGES.TAMIL;
  const combinedClassName = isTamil ? `tamil-text ${className}` : className;
  
  return (
    <span className={combinedClassName}>
      {translate(textKey)}
    </span>
  );
};

export default TranslatedText;