import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuranText } from "./QuranText";

describe("QuranText", () => {
  it("renders canonical text and an accessible ayah marker", () => {
    render(<QuranText verseKey="112:1" />);
    expect(screen.getByText(/قُلْ هُوَ/)).toHaveAttribute("dir", "rtl");
    const marker = screen.getByLabelText("Ayah 1");
    expect(marker).toHaveTextContent("١");
    expect(marker).not.toHaveTextContent("۝");
  });

  it("can render an unnumbered marker without revealing the ayah number", () => {
    const { container } = render(<QuranText verseKey="112:1" marker="empty" />);

    expect(container.querySelector(".ayah-marker")).toHaveTextContent("۝");
    expect(container.querySelector(".ayah-marker")).not.toHaveTextContent("١");
    expect(container.querySelector('[aria-label="Ayah 1"]')).not.toBeInTheDocument();
  });
});
