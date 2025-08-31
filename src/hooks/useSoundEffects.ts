import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { SOUND_CONFIG } from "../app/(protected)/constants/api";

type SoundType = "newOrder" | "checkout" | "staffCall";

export interface UseSoundEffectsReturn {
  playSound: (type: SoundType, tableId?: string) => Promise<void>;
  stopStaffCallSound: (tableId?: string) => void;
  soundPlayingTables: Set<string>;
  setSoundPlayingTables: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const useSoundEffects = (): UseSoundEffectsReturn => {
  const [soundPlayingTables, setSoundPlayingTables] = useState<Set<string>>(
    new Set()
  );

  const newOrderAudioRef = useRef<HTMLAudioElement | null>(null);
  const checkoutAudioRef = useRef<HTMLAudioElement | null>(null);
  const staffCallSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio files
  useEffect(() => {
    if (typeof window !== "undefined" && "Audio" in window) {
      try {
        newOrderAudioRef.current = new Audio("/soundEffect.mp3");
        checkoutAudioRef.current = new Audio("/checkout.mp3");
        staffCallSoundRef.current = new Audio("/callStaff.mp3");

        const audioRefs = [
          {
            ref: newOrderAudioRef,
            volume: SOUND_CONFIG.NEW_ORDER_VOLUME || 0.7,
          },
          {
            ref: checkoutAudioRef,
            volume: SOUND_CONFIG.CHECKOUT_VOLUME || 0.7,
          },
          {
            ref: staffCallSoundRef,
            volume: SOUND_CONFIG.STAFF_CALL_VOLUME || 0.8,
          },
        ];

        audioRefs.forEach(({ ref, volume }, index) => {
          if (ref.current) {
            ref.current.volume = volume;
            ref.current.preload = "auto";

            ref.current.addEventListener("error", (e) => {
              console.error(`Audio ${index} error:`, e);
            });

            ref.current.addEventListener("canplaythrough", () => {
              console.log(`Audio ${index} loaded successfully`);
            });
          }
        });

        // Unlock audio context
        const unlockAudio = () => {
          audioRefs.forEach(({ ref }) => {
            if (ref.current) {
              const playPromise = ref.current.play();
              if (playPromise) {
                playPromise
                  .then(() => {
                    ref.current!.pause();
                    ref.current!.currentTime = 0;
                    console.log("Audio context unlocked");
                  })
                  .catch(() => {});
              }
            }
          });
        };

        const events = ["click", "touchstart", "keydown", "mousedown"];
        const unlockHandler = () => {
          unlockAudio();
          events.forEach((event) => {
            document.removeEventListener(event, unlockHandler);
          });
        };

        events.forEach((event) => {
          document.addEventListener(event, unlockHandler, { once: true });
        });
      } catch (error) {
        console.warn("Failed to initialize audio:", error);
      }
    }

    return () => {
      [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
        (audioRef) => {
          if (audioRef.current) {
            audioRef.current.removeEventListener("error", () => {});
            audioRef.current.removeEventListener("canplaythrough", () => {});
          }
        }
      );
    };
  }, []);

  const stopStaffCallSound = useCallback((tableId?: string) => {
    const audio = staffCallSoundRef.current;

    if (tableId) {
      setSoundPlayingTables((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tableId);

        if (newSet.size === 0 && audio) {
          audio.pause();
          audio.currentTime = 0;
          console.log(`🔇 Stopped staff call sound for table ${tableId}`);
        }

        return newSet;
      });
    } else {
      setSoundPlayingTables(new Set());
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        console.log("🔇 Stopped all staff call sounds");
      }
    }
  }, []);

  const playSound = useCallback(async (type: SoundType, tableId?: string) => {
    let audio: HTMLAudioElement | null = null;
    let soundName = "";

    switch (type) {
      case "newOrder":
        audio = newOrderAudioRef.current;
        soundName = "New Order";
        break;
      case "checkout":
        audio = checkoutAudioRef.current;
        soundName = "Checkout";
        break;
      case "staffCall":
        audio = staffCallSoundRef.current;
        soundName = "Staff Call";
        break;
    }

    if (!audio) {
      console.warn(`${soundName} audio not initialized`);
      return;
    }

    try {
      audio.currentTime = 0;

      if (audio.readyState >= 2) {
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          await playPromise;
          console.log(`✅ ${soundName} sound played successfully`);

          // For staff call sound - loop until stopped
          if (type === "staffCall" && tableId) {
            setSoundPlayingTables((prev) => new Set(prev).add(tableId));

            const loopSound = () => {
              setSoundPlayingTables((current) => {
                if (current.has(tableId) && audio) {
                  const playNext = () => {
                    if (current.has(tableId)) {
                      try {
                        audio.currentTime = 0;
                        audio
                          .play()
                          .then(() => {
                            console.log(
                              `🔄 ${soundName} loop play for table ${tableId}`
                            );
                            setTimeout(() => {
                              setSoundPlayingTables((stillCurrent) => {
                                if (stillCurrent.has(tableId)) {
                                  loopSound();
                                }
                                return stillCurrent;
                              });
                            }, SOUND_CONFIG.STAFF_CALL_LOOP_INTERVAL || 1000);
                          })
                          .catch((err) => {
                            console.warn(`⚠️ ${soundName} loop failed:`, err);
                            setSoundPlayingTables((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(tableId);
                              return newSet;
                            });
                          });
                      } catch (err) {
                        console.warn(`⚠️ ${soundName} loop error:`, err);
                        setSoundPlayingTables((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(tableId);
                          return newSet;
                        });
                      }
                    }
                  };

                  if (audio.ended || audio.paused) {
                    playNext();
                  } else {
                    const onEnded = () => {
                      audio.removeEventListener("ended", onEnded);
                      playNext();
                    };
                    audio.addEventListener("ended", onEnded);
                  }
                }
                return current;
              });
            };

            const startLoop = () => {
              audio.removeEventListener("ended", startLoop);
              setTimeout(loopSound, 500);
            };
            audio.addEventListener("ended", startLoop);
          }
        }
      } else {
        console.log(`Audio not ready, waiting for ${soundName}...`);

        const onCanPlay = async () => {
          audio!.removeEventListener("canplaythrough", onCanPlay);
          try {
            audio!.currentTime = 0;
            await audio!.play();
            console.log(`✅ ${soundName} sound played after loading`);
          } catch (err) {
            console.warn(`⚠️ ${soundName} failed after loading:`, err);
          }
        };

        audio.addEventListener("canplaythrough", onCanPlay);
        setTimeout(() => {
          audio!.removeEventListener("canplaythrough", onCanPlay);
        }, 2000);
      }
    } catch (error: unknown) {
      console.warn(`⚠️ ${soundName} sound failed to play:`, error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        toast.info(`เปิดเสียงแจ้งเตือน ${soundName}`, {
          description: "กรุณาคลิกที่หน้าจอเพื่อเปิดใช้งานเสียง",
          duration: 3000,
          action: {
            label: "เปิดเสียง",
            onClick: () => {
              [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
                (audioRef) => {
                  if (audioRef.current) {
                    audioRef.current
                      .play()
                      .then(() => {
                        audioRef.current!.pause();
                        audioRef.current!.currentTime = 0;
                      })
                      .catch(() => {});
                  }
                }
              );
            },
          },
        });
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSoundPlayingTables(new Set());
      [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
        (audioRef) => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      );
    };
  }, []);

  // Additional effect to unlock audio on user interaction
  useEffect(() => {
    const unlockAllSounds = () => {
      [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach((ref) => {
        if (ref.current) {
          ref.current
            .play()
            .then(() => {
              ref.current!.pause();
              ref.current!.currentTime = 0;
            })
            .catch(() => {});
        }
      });
      window.removeEventListener("click", unlockAllSounds);
      window.removeEventListener("touchstart", unlockAllSounds);
      window.removeEventListener("keydown", unlockAllSounds);
    };

    window.addEventListener("click", unlockAllSounds);
    window.addEventListener("touchstart", unlockAllSounds);
    window.addEventListener("keydown", unlockAllSounds);

    return () => {
      window.removeEventListener("click", unlockAllSounds);
      window.removeEventListener("touchstart", unlockAllSounds);
      window.removeEventListener("keydown", unlockAllSounds);
    };
  }, []);

  return {
    playSound,
    stopStaffCallSound,
    soundPlayingTables,
    setSoundPlayingTables,
  };
};
