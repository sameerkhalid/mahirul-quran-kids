let currentAudio: HTMLAudioElement | null = null;
let currentOnStop: (() => void) | null = null;

export function stopCurrentAudio(): void {
  currentAudio?.pause();
  currentAudio = null;
  const notify = currentOnStop;
  currentOnStop = null;
  notify?.();
}

export function playAudioFile(path: string, onEnded?: () => void): Promise<void> {
  stopCurrentAudio();
  const source = `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
  const audio = new Audio(source);
  currentAudio = audio;
  currentOnStop = onEnded ?? null;
  const finish = () => {
    if (currentAudio !== audio) return;
    currentAudio = null;
    currentOnStop = null;
    onEnded?.();
  };
  audio.addEventListener("ended", finish, { once: true });
  audio.addEventListener("error", finish, { once: true });
  return audio.play().catch((error) => {
    finish();
    throw error;
  });
}
