import React from 'react';
import { Shield, Menu, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ht' : 'en';
    i18n.changeLanguage(newLang);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-red-700 text-white h-16 fixed top-0 left-0 right-0 z-50">
        <div className="h-full px-4">
          <div className="flex justify-between items-center h-full">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">{t('app.name')}</span>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-red-600"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t('menu.title')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            {/* Language Switcher */}
            <div 
              onClick={toggleLanguage}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-600" />
                <div className="flex flex-col">
                  <span className="text-base font-medium text-gray-900">
                    {t('language.switch')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {t(`language.${i18n.language}`)}
                  </span>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="font-medium bg-white border-gray-200"
              >
                {t(`language.${i18n.language === 'en' ? 'ht' : 'en'}`)}
              </Badge>
            </div>

            {/* App Info */}
            <div className="px-4">
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Shield className="h-8 w-8 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('app.name')}
                  </h3>
                  <p className="text-sm text-gray-500">Version 1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}