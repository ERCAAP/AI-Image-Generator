import { create } from 'zustand';
import { GenerationRequest, User } from '../types/user';

interface UserState {
  // User data
  currentUser: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  
  // Credits
  credits: number;
  
  // Generation history
  generations: GenerationRequest[];
  activeGenerations: GenerationRequest[];
  
  // Settings
  language: string;
  
  // Actions
  setUser: (user: User | null) => void;
  setCredits: (credits: number) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  addGeneration: (generation: GenerationRequest) => void;
  updateGeneration: (id: string, updates: Partial<GenerationRequest>) => void;
  setLanguage: (language: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  currentUser: null,
  isInitialized: false,
  isLoading: false,
  credits: 0,
  generations: [],
  activeGenerations: [],
  language: 'tr',

  // Actions
  setUser: (user) => {
    set({ 
      currentUser: user,
      credits: user?.credits || 0,
      language: user?.settings.language || 'tr'
    });
  },

  setCredits: (credits) => {
    set({ credits });
    const user = get().currentUser;
    if (user) {
      set({ currentUser: { ...user, credits } });
    }
  },

  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  setLoading: (loading) => set({ isLoading: loading }),

  addGeneration: (generation) => {
    set((state) => ({
      generations: [generation, ...state.generations],
      activeGenerations: generation.status === 'pending' || generation.status === 'processing'
        ? [generation, ...state.activeGenerations]
        : state.activeGenerations
    }));
  },

  updateGeneration: (id, updates) => {
    set((state) => ({
      generations: state.generations.map(gen => 
        gen.id === id ? { ...gen, ...updates } : gen
      ),
      activeGenerations: updates.status === 'completed' || updates.status === 'failed'
        ? state.activeGenerations.filter(gen => gen.id !== id)
        : state.activeGenerations.map(gen => 
            gen.id === id ? { ...gen, ...updates } : gen
          )
    }));
  },

  setLanguage: (language) => {
    set({ language });
    const user = get().currentUser;
    if (user) {
      set({ 
        currentUser: { 
          ...user, 
          settings: { ...user.settings, language } 
        } 
      });
    }
  },

  reset: () => set({
    currentUser: null,
    isInitialized: false,
    isLoading: false,
    credits: 0,
    generations: [],
    activeGenerations: [],
    language: 'tr'
  })
})); 