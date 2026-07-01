import { create } from 'zustand';
import { ReplicateModel } from '../types/api';
import { AuthUser } from '../hooks/useAuth';

interface AppState {
  // App state
  isFirstLaunch: boolean;
  hasCompletedOnboarding: boolean;
  
  // User state
  user: AuthUser | null;
  
  // Models
  models: ReplicateModel[];
  selectedModel: ReplicateModel | null;
  
  // Templates
  templates: any[];
  selectedTemplate: any | null;
  
  // UI state
  currentTab: 'discover' | 'creations';
  isGenerating: boolean;
  
  // Settings
  theme: 'dark' | 'light' | 'auto';
  
  // Actions
  setFirstLaunch: (isFirst: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  setModels: (models: ReplicateModel[]) => void;
  setSelectedModel: (model: ReplicateModel | null) => void;
  setTemplates: (templates: any[]) => void;
  setSelectedTemplate: (template: any | null) => void;
  setCurrentTab: (tab: 'discover' | 'creations') => void;
  setGenerating: (generating: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isFirstLaunch: true,
  hasCompletedOnboarding: false,
  user: null,
  models: [],
  selectedModel: null,
  templates: [],
  selectedTemplate: null,
  currentTab: 'discover',
  isGenerating: false,
  theme: 'dark',

  // Actions
  setFirstLaunch: (isFirst) => set({ isFirstLaunch: isFirst }),
  
  setOnboardingCompleted: (completed) => set({ hasCompletedOnboarding: completed }),
  
  setUser: (user) => set({ user }),
  
  setModels: (models) => set({ models }),
  
  setSelectedModel: (model) => set({ selectedModel: model }),
  
  setTemplates: (templates) => set({ templates }),
  
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  setGenerating: (generating) => set({ isGenerating: generating }),
  
  setTheme: (theme) => set({ theme }),
  
  reset: () => set({
    isFirstLaunch: false,
    hasCompletedOnboarding: false,
    user: null,
    models: [],
    selectedModel: null,
    templates: [],
    selectedTemplate: null,
    currentTab: 'discover',
    isGenerating: false,
    theme: 'dark'
  })
}));