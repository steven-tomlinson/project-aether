import { BookManifest } from './types';

export const LIBRARY_MANIFEST: BookManifest[] = [
  {
    id: "martian_odyssey",
    title: "A Martian Odyssey",
    author: "Stanley G. Weinbaum",
    publicationYear: 1934,
    description: "An American astronaut crash-lands on Mars and befriends a bird-like creature named Tweel. A pulp adventure classic.",
    coverImage: "https://picsum.photos/400/600?grayscale",
    tags: ["Pulp", "Adventure", "First Contact"],
    theme: {
      primaryColor: "#FF4500",
      font: "Orbitron",
      backgroundStyle: "pulp_texture"
    },
    audioProfile: {
      narratorVoice: "Aoede",
      ambientTrack: "desert_wind"
    },
    scenes: []
  },
  {
    id: "variable_man",
    title: "The Variable Man",
    author: "Philip K. Dick",
    publicationYear: 1953,
    description: "A man from the past is brought to the future as a random variable in an interstellar war calculation.",
    coverImage: "https://picsum.photos/401/600?grayscale",
    tags: ["Industrial", "War", "Time Travel"],
    theme: {
      primaryColor: "#00BFFF",
      font: "Share Tech Mono",
      backgroundStyle: "industrial_blueprint"
    },
    audioProfile: {
      narratorVoice: "Charon",
      ambientTrack: "computer_hum"
    },
    scenes: []
  },
  {
    id: "defenders",
    title: "The Defenders",
    author: "Philip K. Dick",
    publicationYear: 1953,
    description: "Humanity hides in bunkers while robots fight on the surface. Or do they?",
    coverImage: "https://picsum.photos/402/600?grayscale",
    tags: ["Post-Apocalyptic", "Robots", "Dystopia"],
    theme: {
      primaryColor: "#32CD32",
      font: "Share Tech Mono",
      backgroundStyle: "noir_shadows"
    },
    audioProfile: {
      narratorVoice: "Fenrir",
      ambientTrack: "subterranean_rumble"
    },
    scenes: []
  },
  {
    id: "piper_woods",
    title: "Piper in the Woods",
    author: "Philip K. Dick",
    publicationYear: 1953,
    description: "Soldiers returning from an asteroid base claim they are plants. A psychological mystery.",
    coverImage: "https://picsum.photos/403/600?grayscale",
    tags: ["Surreal", "Psychological", "Mystery"],
    theme: {
      primaryColor: "#228B22",
      font: "Merriweather",
      backgroundStyle: "clinical_white"
    },
    audioProfile: {
      narratorVoice: "Puck",
      ambientTrack: "wind_leaves"
    },
    scenes: []
  },
  {
    id: "skull",
    title: "The Skull",
    author: "Philip K. Dick",
    publicationYear: 1952,
    description: "A man is sent back in time to kill a religious founder, only to find a paradox.",
    coverImage: "https://picsum.photos/404/600?grayscale",
    tags: ["Noir", "Time Travel", "Religious"],
    theme: {
      primaryColor: "#8B4513",
      font: "Share Tech Mono",
      backgroundStyle: "noir_shadows"
    },
    audioProfile: {
      narratorVoice: "Kore",
      ambientTrack: "dripping_water"
    },
    scenes: []
  },
  {
    id: "2br02b",
    title: "2 B R 0 2 B",
    author: "Kurt Vonnegut",
    publicationYear: 1962,
    description: "In a world where aging has been cured, population control is strictly enforced.",
    coverImage: "https://picsum.photos/405/600?grayscale",
    tags: ["Satire", "Dystopia", "Sociological"],
    theme: {
      primaryColor: "#800080",
      font: "Orbitron",
      backgroundStyle: "clinical_white"
    },
    audioProfile: {
      narratorVoice: "Zephyr",
      ambientTrack: "hospital_beeps"
    },
    scenes: []
  }
];
