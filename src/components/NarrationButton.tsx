import { useEffect, useState } from "react";
import { playAudioFile } from "../lib/audio-player";
import { useAppState } from "../state/AppState";
import { SpeakerIcon } from "./Icons";

export function NarrationButton({ file, label }: { file: string; label: string }) {
  const { progress } = useAppState();
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (!progress.audioEnabled) return;
    setPlaying(true);
    void playAudioFile(file, () => setPlaying(false)).catch(() => setPlaying(false));
  };

  useEffect(() => {
    if (!progress.audioEnabled) return;
    const timer = window.setTimeout(play, 180);
    return () => window.clearTimeout(timer);
    // Narrate once when a new question heading mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, progress.audioEnabled]);

  if (!progress.audioEnabled) return null;
  return (
    <button className={`narration-button ${playing ? "narration-button--playing" : ""}`} type="button" onClick={play} aria-label={label}>
      <SpeakerIcon size={22} />
      <span>{playing ? "Playing" : "Hear question"}</span>
    </button>
  );
}
