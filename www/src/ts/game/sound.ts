const MusicSong = document.createElement("audio");

const EffectSong = document.createElement("audio");

const JoinSong = document.createElement("audio");

MusicSong.src = "/sound/music.mp3";
EffectSong.src = "/sound/beeps.mp3";
JoinSong.src = "/sound/join.mp3";

export {
  MusicSong,
  EffectSong,
  JoinSong
};