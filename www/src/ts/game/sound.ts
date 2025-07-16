const createAudio = (src: string): HTMLAudioElement => {
  const audio = document.createElement("audio");
  audio.src = src;
  return audio;
};

/** Main background music for the game. */
export const MusicSong = createAudio("https://cookie-clicker-brasil.vercel.app/sound/music.mp3");

/** Beep sound effect used for quick actions. */
export const EffectSong = createAudio("https://cookie-clicker-brasil.vercel.app/sound/beeps.mp3");

/** Notification sound played when a player joins. */
export const JoinSong = createAudio("https://cookie-clicker-brasil.vercel.app/sound/join.mp3");

/** Click sound effect for UI interactions. */
export const ClickSong = createAudio("https://cookie-clicker-brasil.vercel.app/sound/click.mp3");