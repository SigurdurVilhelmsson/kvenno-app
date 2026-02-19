export type SoundType = 'correct' | 'incorrect' | 'streak' | 'pop';

export function playSound(soundEnabled: boolean, type: SoundType): void {
  if (!soundEnabled) return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'correct':
        oscillator.frequency.value = 523.25; // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'incorrect':
        oscillator.frequency.value = 220; // A3
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;

      case 'streak':
        // Celebration fanfare - ascending notes
        [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + i * 0.1 + 0.3
          );
          osc.start(audioContext.currentTime + i * 0.1);
          osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
        });
        break;

      case 'pop':
        oscillator.frequency.value = 880; // A5
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
    }
  } catch (e) {
    // Silently fail if audio context not available
  }
}
