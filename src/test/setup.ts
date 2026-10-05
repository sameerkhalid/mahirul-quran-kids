import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class AudioMock {
  pause = vi.fn();
  play = vi.fn().mockResolvedValue(undefined);
  addEventListener = vi.fn();
}

vi.stubGlobal("Audio", AudioMock);
