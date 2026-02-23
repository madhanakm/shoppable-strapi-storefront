import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getPopup, PopupData } from '@/services/popup';

const SitePopup = () => {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadPopup();
  }, []);

  const loadPopup = async () => {
    const data = await getPopup();
    if (data && data.status) {
      setPopup(data);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
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

        {popup.message && (
          <div className="p-6">
            <p className="text-gray-700 text-center whitespace-pre-line">{popup.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SitePopup;
