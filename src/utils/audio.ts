import { Audio } from 'expo-av';

let backgroundMusic: Audio.Sound | null = null;
let isMusicPlaying = false;

export const playBackgroundMusic = async () => {
  if (isMusicPlaying) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/science_fiction/space_room_hum.ogg' },
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
      { uri: 'https://actions.google.com/sounds/v1/cartoon/woodplank_flick.ogg' },
      { shouldPlay: true, volume: 0.8 }
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
      { uri: 'https://actions.google.com/sounds/v1/science_fiction/laser_pew.ogg' },
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
