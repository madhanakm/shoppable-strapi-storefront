export interface PopupData {
  photo: string;
  message: string;
  status: boolean;
  buttonText?: string;
  buttonLink?: string;
}

export const getPopup = async (): Promise<PopupData | null> => {
  try {
    const response = await fetch('https://api.dharaniherbbals.com/api/popup', {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const attrs = data.data?.attributes;

    if (!attrs || !attrs.status) return null;

    return {
      photo: attrs.photo || '',
      message: attrs.message || '',
      status: attrs.status,
      buttonText: attrs.buttonText || '',
      buttonLink: attrs.buttonLink || ''
    };
  } catch (error) {
    return null;
  }
};
