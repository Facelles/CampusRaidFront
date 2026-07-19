import { Audio } from 'expo-av';

let backgroundMusic: Audio.Sound | null = null;
let isMusicPlaying = false;
let isMusicLoading = false;

export const playBackgroundMusic = async () => {
  if (isMusicPlaying) return;
  
  try {
    if (!backgroundMusic) {
      if (isMusicLoading) return;
      isMusicLoading = true;
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
        { shouldPlay: false, isLooping: true, volume: 0.3 }
      );
      backgroundMusic = sound;
      isMusicLoading = false;
    }

    await backgroundMusic.playAsync();
    isMusicPlaying = true;
  } catch (error) {
    console.log('Audio disabled or failed (normal for web until user interacts)', error);
    isMusicLoading = false;
  }
};

export const stopBackgroundMusic = async () => {
  if (!backgroundMusic || !isMusicPlaying) return;
  try {
    await backgroundMusic.pauseAsync();
    isMusicPlaying = false;
  } catch (error) {
    console.error('Failed to stop background music', error);
  }
};

let actionSound: Audio.Sound | null = null;
export const playActionSound = async () => {
  try {
    if (!actionSound) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b824338e.mp3?filename=pop-39222.mp3' },
        { shouldPlay: false, volume: 0.15 }
      );
      actionSound = sound;
    }
    await actionSound.replayAsync();
  } catch (error) {
    // Ignore error for web autoplay policies
  }
};

let criticalSound: Audio.Sound | null = null;
export const playCriticalHitSound = async () => {
  try {
    if (!criticalSound) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2289c8a9f2.mp3?filename=retro-video-game-coin-pickup-38299.mp3' },
        { shouldPlay: false, volume: 0.6 }
      );
      criticalSound = sound;
    }
    await criticalSound.replayAsync();
  } catch (error) {
    // Ignore error
  }
};
