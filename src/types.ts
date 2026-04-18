export type Section = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  keywords: string[];
};

export type AppState = {
  activeSection: string;
  isAudioLoading: boolean;
  audioUrl: string | null;
  isPlaying: boolean;
  voiceName: string;
};
