import { useState, useCallback, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseGameSoundsReturn {
  /** Play a short high-pitched tick (e.g. button press) */
  playClick: () => void;
  /** Play an ascending two-tone chime (correct answer) */
  playCorrect: () => void;
  /** Play a low dissonant buzz (wrong answer) */
  playWrong: () => void;
  /** Play a rising arpeggiated chord (level complete) */
  playLevelComplete: () => void;
  /** Play a celebratory jingle with sparkle (achievement unlocked) */
  playAchievement: () => void;
  /** Play an escalating tone whose pitch rises with the streak count */
  playStreak: (count: number) => void;
  /** Whether sound is currently enabled */
  isEnabled: boolean;
  /** Toggle sound on/off */
  toggleSound: () => void;
  /** Explicitly set the enabled state */
  setEnabled: (enabled: boolean) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'kvenno-sound-enabled';
const MASTER_VOLUME = 0.3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read the persisted sound-enabled preference from localStorage.
 * Defaults to false (sounds OFF).
 */
function readEnabledState(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return false; // default: sounds OFF
  } catch {
    return false;
  }
}

/**
 * Persist the sound-enabled preference to localStorage.
 */
function writeEnabledState(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // localStorage may be unavailable — ignore silently
  }
}

/**
 * Check whether the Web Audio API is available in the current environment.
 */
function isWebAudioSupported(): boolean {
  return typeof window !== 'undefined' &&
    (typeof AudioContext !== 'undefined' || typeof (window as unknown as Record<string, unknown>).webkitAudioContext !== 'undefined');
}

/**
 * Create or resume an AudioContext.
 * Handles the browser autoplay-policy requirement (context starts suspended
 * until triggered by a user gesture).
 */
function ensureAudioContext(ctxRef: React.MutableRefObject<AudioContext | null>): AudioContext | null {
  if (!isWebAudioSupported()) return null;

  if (!ctxRef.current) {
    const Ctor = window.AudioContext ?? (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext;
    ctxRef.current = new Ctor();
  }

  // Resume suspended context (browser autoplay policy)
  if (ctxRef.current.state === 'suspended') {
    ctxRef.current.resume().catch(() => {
      // Ignore — we'll try again on the next user gesture
    });
  }

  return ctxRef.current;
}

// ---------------------------------------------------------------------------
// Sound synthesis helpers
// ---------------------------------------------------------------------------

type OscType = OscillatorType;

interface NoteSpec {
  freq: number;
  type: OscType;
  startTime: number;
  duration: number;
  gain: number;
  /** Attack time in seconds (default 0.01) */
  attack?: number;
  /** Release time in seconds (default 0.04) */
  release?: number;
}

/**
 * Schedule a single oscillator note with an ADSR-like gain envelope.
 * Automatically stops and disconnects the oscillator when done.
 */
function scheduleNote(
  ctx: AudioContext,
  destination: AudioNode,
  spec: NoteSpec,
): void {
  const { freq, type, startTime, duration, gain, attack = 0.01, release = 0.04 } = spec;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Gain envelope: silence → attack → sustain → release → silence
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + attack);
  gainNode.gain.setValueAtTime(gain, startTime + duration - release);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05); // small buffer before cleanup
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides synthesized game sound effects using the Web Audio API.
 *
 * All sounds are generated on-the-fly via oscillators — no audio files are
 * required. The hook reads/writes a user preference to localStorage so the
 * choice persists across sessions.
 *
 * Sounds are OFF by default to avoid surprising the user.
 *
 * @example
 * ```tsx
 * const { playCorrect, playWrong, isEnabled, toggleSound } = useGameSounds();
 *
 * // In an answer handler:
 * if (correct) playCorrect(); else playWrong();
 *
 * // Toggle button:
 * <SoundToggle isEnabled={isEnabled} onToggle={toggleSound} />
 * ```
 */
export function useGameSounds(): UseGameSoundsReturn {
  const [isEnabled, setIsEnabled] = useState<boolean>(readEnabledState);
  const ctxRef = useRef<AudioContext | null>(null);

  // Keep localStorage in sync whenever isEnabled changes
  useEffect(() => {
    writeEnabledState(isEnabled);
  }, [isEnabled]);

  // -----------------------------------------------------------------------
  // State setters
  // -----------------------------------------------------------------------

  const toggleSound = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  // -----------------------------------------------------------------------
  // Sound play functions
  // -----------------------------------------------------------------------

  /**
   * Short high-pitched tick — triangle wave at 800 Hz, 40 ms.
   */
  const playClick = useCallback(() => {
    if (!isEnabled) return;
    try {
      const ctx = ensureAudioContext(ctxRef);
      if (!ctx) return;
      const now = ctx.currentTime;

      scheduleNote(ctx, ctx.destination, {
        freq: 800,
        type: 'triangle',
        startTime: now,
        duration: 0.04,
        gain: MASTER_VOLUME,
        attack: 0.005,
        release: 0.02,
      });
    } catch {
      // Graceful degradation — no sound
    }
  }, [isEnabled]);

  /**
   * Ascending two-tone chime — C5 (523 Hz) then E5 (659 Hz).
   * Pleasant major-third interval signaling a correct answer.
   */
  const playCorrect = useCallback(() => {
    if (!isEnabled) return;
    try {
      const ctx = ensureAudioContext(ctxRef);
      if (!ctx) return;
      const now = ctx.currentTime;

      // First tone: C5 for 80 ms
      scheduleNote(ctx, ctx.destination, {
        freq: 523,
        type: 'sine',
        startTime: now,
        duration: 0.08,
        gain: MASTER_VOLUME,
        attack: 0.01,
        release: 0.03,
      });

      // Second tone: E5 for 120 ms
      scheduleNote(ctx, ctx.destination, {
        freq: 659,
        type: 'sine',
        startTime: now + 0.08,
        duration: 0.12,
        gain: MASTER_VOLUME,
        attack: 0.01,
        release: 0.06,
      });
    } catch {
      // Graceful degradation
    }
  }, [isEnabled]);

  /**
   * Low dissonant buzz — two slightly detuned sawtooth oscillators
   * at 150 Hz and 153 Hz, 150 ms.
   */
  const playWrong = useCallback(() => {
    if (!isEnabled) return;
    try {
      const ctx = ensureAudioContext(ctxRef);
      if (!ctx) return;
      const now = ctx.currentTime;
      const buzzGain = MASTER_VOLUME * 0.6;

      scheduleNote(ctx, ctx.destination, {
        freq: 150,
        type: 'sawtooth',
        startTime: now,
        duration: 0.15,
        gain: buzzGain,
        attack: 0.01,
        release: 0.06,
      });

      // Slightly detuned second oscillator for dissonance
      scheduleNote(ctx, ctx.destination, {
        freq: 153,
        type: 'sawtooth',
        startTime: now,
        duration: 0.15,
        gain: buzzGain,
        attack: 0.01,
        release: 0.06,
      });
    } catch {
      // Graceful degradation
    }
  }, [isEnabled]);

  /**
   * Rising arpeggiated chord: C5 → E5 → G5 with 100 ms gaps.
   * Each note is a 200 ms sine wave. A subtle delay effect adds depth.
   */
  const playLevelComplete = useCallback(() => {
    if (!isEnabled) return;
    try {
      const ctx = ensureAudioContext(ctxRef);
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [
        { freq: 523, offset: 0 },     // C5
        { freq: 659, offset: 0.1 },   // E5
        { freq: 784, offset: 0.2 },   // G5
      ];

      // Create a subtle delay effect for reverb-like depth
      const delayNode = ctx.createDelay(0.5);
      delayNode.delayTime.setValueAtTime(0.12, now);
      const feedbackGain = ctx.createGain();
      feedbackGain.gain.setValueAtTime(0.2, now);
      const dryGain = ctx.createGain();
      dryGain.gain.setValueAtTime(1, now);
      const wetGain = ctx.createGain();
      wetGain.gain.setValueAtTime(0.15, now);

      // Routing: notes → dryGain → destination
      //          notes → delayNode → feedbackGain → delayNode (feedback loop)
      //          delayNode → wetGain → destination
      dryGain.connect(ctx.destination);
      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);
      delayNode.connect(wetGain);
      wetGain.connect(ctx.destination);

      for (const { freq, offset } of notes) {
        // Dry path
        scheduleNote(ctx, dryGain, {
          freq,
          type: 'sine',
          startTime: now + offset,
          duration: 0.2,
          gain: MASTER_VOLUME,
          attack: 0.01,
          release: 0.08,
        });

        // Feed the delay
        scheduleNote(ctx, delayNode, {
          freq,
          type: 'sine',
          startTime: now + offset,
          duration: 0.2,
          gain: MASTER_VOLUME,
          attack: 0.01,
          release: 0.08,
        });
      }

      // Clean up delay nodes after sounds finish
      const cleanupTime = (now + 0.6) * 1000 - ctx.currentTime * 1000 + 200;
      setTimeout(() => {
        try {
          delayNode.disconnect();
          feedbackGain.disconnect();
          dryGain.disconnect();
          wetGain.disconnect();
        } catch {
          // Already disconnected
        }
      }, Math.max(cleanupTime, 1000));
    } catch {
      // Graceful degradation
    }
  }, [isEnabled]);

  /**
   * Celebratory jingle: quick ascending arpeggio C5 → E5 → G5 → C6
   * with 60 ms gaps, followed by a high-frequency sparkle flutter.
   */
  const playAchievement = useCallback(() => {
    if (!isEnabled) return;
    try {
      const ctx = ensureAudioContext(ctxRef);
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [
        { freq: 523, offset: 0 },      // C5
        { freq: 659, offset: 0.06 },   // E5
        { freq: 784, offset: 0.12 },   // G5
        { freq: 1047, offset: 0.18 },  // C6
      ];

      for (const { freq, offset } of notes) {
        scheduleNote(ctx, ctx.destination, {
          freq,
          type: 'sine',
          startTime: now + offset,
          duration: 0.15,
          gain: MASTER_VOLUME,
          attack: 0.01,
          release: 0.06,
        });
      }

      // Sparkle effect: high triangle wave flutter at the end
      const sparkleStart = now + 0.26;
      const sparkleCount = 4;
      for (let i = 0; i < sparkleCount; i++) {
        scheduleNote(ctx, ctx.destination, {
          freq: 2000 + i * 200,
          type: 'triangle',
          startTime: sparkleStart + i * 0.04,
          duration: 0.05,
          gain: MASTER_VOLUME * 0.4,
          attack: 0.005,
          release: 0.02,
        });
      }
    } catch {
      // Graceful degradation
    }
  }, [isEnabled]);

  /**
   * Escalating tone based on streak count. Uses the same two-tone pattern
   * as `playCorrect` but pitch-shifts upward and adds harmonic overtones
   * at higher streak values.
   *
   * - Streak < 3: normal pitch
   * - Streak 3-4: normal pitch
   * - Streak 5-9: +200 Hz
   * - Streak 10+: +400 Hz + harmonic overtone
   */
  const playStreak = useCallback(
    (count: number) => {
      if (!isEnabled) return;
      try {
        const ctx = ensureAudioContext(ctxRef);
        if (!ctx) return;
        const now = ctx.currentTime;

        let pitchOffset = 0;
        if (count >= 10) {
          pitchOffset = 400;
        } else if (count >= 5) {
          pitchOffset = 200;
        }

        const baseFreq1 = 523 + pitchOffset; // C5 + offset
        const baseFreq2 = 659 + pitchOffset; // E5 + offset

        // First tone
        scheduleNote(ctx, ctx.destination, {
          freq: baseFreq1,
          type: 'sine',
          startTime: now,
          duration: 0.08,
          gain: MASTER_VOLUME,
          attack: 0.01,
          release: 0.03,
        });

        // Second tone
        scheduleNote(ctx, ctx.destination, {
          freq: baseFreq2,
          type: 'sine',
          startTime: now + 0.08,
          duration: 0.12,
          gain: MASTER_VOLUME,
          attack: 0.01,
          release: 0.06,
        });

        // At streak 10+, add harmonic overtone (octave above second tone)
        if (count >= 10) {
          scheduleNote(ctx, ctx.destination, {
            freq: baseFreq2 * 2,
            type: 'sine',
            startTime: now + 0.08,
            duration: 0.12,
            gain: MASTER_VOLUME * 0.3,
            attack: 0.01,
            release: 0.06,
          });
        }
      } catch {
        // Graceful degradation
      }
    },
    [isEnabled],
  );

  return {
    playClick,
    playCorrect,
    playWrong,
    playLevelComplete,
    playAchievement,
    playStreak,
    isEnabled,
    toggleSound,
    setEnabled,
  };
}
