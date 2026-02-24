import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getPopup, PopupData } from '@/services/popup';
import { Button } from '@/components/ui/button';

const SitePopup = () => {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadPopup();
  }, []);

  const loadPopup = async () => {
    try {
      const data = await getPopup();
      if (data && data.status) {
        setPopup(data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Popup load error:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (popup?.buttonLink) {
      if (popup.buttonLink.startsWith('http')) {
        window.open(popup.buttonLink, '_blank');
      } else {
        window.location.href = popup.buttonLink;
      }
      handleClose();
    }
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {popup.photo && (
          <img
            src={popup.photo}
            alt="Popup"
            className="w-full rounded-t-2xl object-contain"
          />
        )}

        <div className="p-6 flex flex-col items-center">
          {popup.message && (
            <p className="text-gray-700 text-center whitespace-pre-line mb-4">{popup.message}</p>
          )}
          
          {popup.buttonText && popup.buttonLink && (
            <Button 
              onClick={handleButtonClick}
              className="bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {popup.buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitePopup;