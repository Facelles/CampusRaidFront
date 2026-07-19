import { Audio } from 'expo-av';

let backgroundMusic: Audio.Sound | null = null;
let isMusicPlaying = false;

export const playBackgroundMusic = async () => {
  if (isMusicPlaying) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
      { shouldPlay: true, isLooping: true, volume: 0.3 }
    );
    backgroundMusic = sound;
    isMusicPlaying = true;
  } catch (error) {
    console.log('Audio disabled or failed (normal for web until user interacts)', error);
  }
};

export const stopBackgroundMusic = async () => {
  if (!isMusicPlaying || !backgroundMusic) return;
  try {
    await backgroundMusic.stopAsync();
    await backgroundMusic.unloadAsync();
    backgroundMusic = null;
    isMusicPlaying = false;
  } catch (error) {
    console.error('Failed to stop background music', error);
  }
};

export const playActionSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3' },
      { shouldPlay: true, volume: 0.5 }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if ('didJustFinish' in status && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    // Ignore error for web autoplay policies
  }
};

export const playCriticalHitSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3' },
      { shouldPlay: true, volume: 1.0 }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if ('didJustFinish' in status && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    // Ignore error
  }
};
