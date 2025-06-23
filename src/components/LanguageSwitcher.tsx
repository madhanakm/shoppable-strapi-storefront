import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useTranslation, LANGUAGES } from './TranslationProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSwitcher = () => {
  const { language, setLanguage, translate } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage(LANGUAGES.ENGLISH)}
          className={language === LANGUAGES.ENGLISH ? 'bg-primary/10' : ''}
        >
          {translate('languageSwitcher.english')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage(LANGUAGES.TAMIL)}
          className={language === LANGUAGES.TAMIL ? 'bg-primary/10' : ''}
        >
          {translate('languageSwitcher.tamil')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;