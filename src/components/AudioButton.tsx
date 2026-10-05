import { useState } from "react";
import { audioManifest } from "../content";
import type { VerseKey } from "../content/types";
import { playAudioFile } from "../lib/audio-player";
import { useAppState } from "../state/AppState";
import { SpeakerIcon } from "./Icons";

export function AudioButton({ verseKey, label = "Listen to this ayah" }: { verseKey: VerseKey; label?: string }) {
  const { progress } = useAppState();
  const [playing, setPlaying] = useState(false);

  if (!progress.audioEnabled) return null;

  const play = () => {
    setPlaying(true);
    void playAudioFile(audioManifest[verseKey], () => setPlaying(false)).catch(() => setPlaying(false));
  };

  return (
    <button className={`audio-button ${playing ? "audio-button--playing" : ""}`} type="button" onClick={play} aria-label={label}>
      <SpeakerIcon />
      <span>{playing ? "Listening…" : "Listen"}</span>
    </button>
  );
}
