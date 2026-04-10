import { create } from 'zustand';

interface ProfileState {
  firstName: string;
  photos: string[];
  primaryPhoto: string | null;

  setFirstName: (name: string) => void;
  setPhotos: (photos: string[]) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  firstName: '',
  photos: [],
  primaryPhoto: null,

  setFirstName: (firstName) => set({ firstName }),

  setPhotos: (photos) =>
    set({
      photos,
      primaryPhoto: photos.length > 0 ? photos[0] : null,
    }),
}));
