/**
 * Creates an audio element with the specified source.
 * @param src - Path to the audio file.
 * @returns An HTMLAudioElement ready to use.
 */
const createAudio = (src: string): HTMLAudioElement => {
  const audio = document.createElement("audio");
  audio.src = src;
  return audio;
};

/** Main background music for the game. */
export const MusicSong = createAudio("/sound/music.mp3");

/** Beep sound effect used for quick actions. */
export const EffectSong = createAudio("/sound/beeps.mp3");

/** Notification sound played when a player joins. */
export const JoinSong = createAudio("/sound/join.mp3");

/** Click sound effect for UI interactions. */
export const ClickSong = createAudio("/sound/click.mp3");