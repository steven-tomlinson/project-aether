export interface Theme {
  primaryColor: string;
  font: 'Orbitron' | 'Share Tech Mono' | 'Merriweather';
  backgroundStyle: 'pulp_texture' | 'industrial_blueprint' | 'noir_shadows' | 'clinical_white';
}

export interface AudioProfile {
  narratorVoice: string;
  ambientTrack: string;
}

export interface Scene {
  id: number;
  text: string;
  imagePrompt: string;
  audioMood: string;
  generatedImageUrl?: string;
  generatedAudioUrl?: string; // New: per-page audio
}

export interface ReaderContent {
  scenes: {
    heading: string;
    text: string;
    imageUrl?: string; // Support for specific scene images
    visual_cue?: string;
  }[];
  masterImageUrl: string; // The single generated image containing 3 panels
  videoUrl?: string; // Cache for the Veo generated video
}

export interface BookManifest {
  id: string;
  title: string;
  author: string;
  publicationYear: number;
  description: string;
  coverImage: string; // Placeholder or generated URL
  tags: string[];
  theme: Theme;
  audioProfile: AudioProfile;
  scenes: Scene[];
  readerContent?: ReaderContent; // Cached content
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  token?: string;
}