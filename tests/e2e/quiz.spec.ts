import { expect, test } from "@playwright/test";

test("starts and preserves a five-question quiz", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /learn, remember/i })).toBeVisible();
  await page.getByRole("link", { name: "Start a quiz" }).click();
  await expect(page.getByRole("heading", { name: "Choose today’s surahs" })).toBeVisible();
  await page.getByRole("button", { name: /Al-Falaq/ }).click();
  await page.getByRole("button", { name: /\bAn-Nas\b/ }).click();
  await page.getByRole("button", { name: /Let’s begin/ }).click();
  await expect(page.getByText("Question 1")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Question 1")).toBeVisible();
});

test("single-surah setup excludes identify questions", async ({ page }) => {
  await page.goto("/setup");
  await page.getByRole("button", { name: /Al-Falaq/ }).click();
  await page.getByRole("button", { name: /\bAn-Nas\b/ }).click();
  await page.getByRole("button", { name: /Let’s begin/ }).click();
  await expect(page.getByText(/Question 1/)).toBeVisible();
});

test("range presets select an inclusive surah range", async ({ page }) => {
  await page.goto("/setup");
  await page.getByRole("button", { name: "Last 10" }).click();
  await expect(page.getByText("10 selected")).toBeVisible();
  await expect(page.getByText("15 questions")).toBeVisible();
  await expect(page.getByRole("button", { name: /Al-Fil/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /\bAn-Nas\b/ })).toHaveAttribute("aria-pressed", "true");
});

test("the final answer opens the celebration results page", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("mahirul-quran:active-session:v1", JSON.stringify({
      id: "last-question-test",
      seed: 1,
      selectedSurahs: [112],
      questions: [{
        id: "112-recite-1",
        type: "recite-next",
        promptAyahKey: "112:1",
        answerAyahKey: "112:2"
      }],
      currentIndex: 0,
      answers: [],
      startedAt: new Date().toISOString()
    }));
    localStorage.removeItem("mahirul-quran:last-result:v1");
  });

  await page.goto("/quiz");
  await expect(page.getByRole("button", { name: "Hear the question" })).toBeVisible();
  await page.getByRole("button", { name: "Show me the answer" }).click();
  await page.getByRole("button", { name: /I remembered/ }).click();
  await expect(page.locator(".mini-confetti")).toBeVisible();
  await expect(page.getByRole("button", { name: /See my results/ })).toBeVisible();

  await expect(page).toHaveURL(/\/results$/, { timeout: 5_000 });
  await expect(page.getByText("Quiz complete")).toBeVisible();
  await expect(page.getByText("A sky full of stars!")).toBeVisible();
});

test("meaning-match connectors align with their option rows", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("mahirul-quran:active-session:v1", JSON.stringify({
      id: "meaning-alignment-test",
      seed: 2,
      selectedSurahs: [107, 112, 113],
      questions: [{
        id: "meanings-107-112-113",
        type: "match-surah-meanings",
        surahNumbers: [112, 107, 113],
        meaningOrder: [112, 113, 107]
      }],
      currentIndex: 0,
      answers: [],
      startedAt: new Date().toISOString()
    }));
  });

  await page.goto("/quiz");
  const markers = page.locator(".match-lines span:not(.match-lines__spacer)");
  const cards = page.locator(".meaning-column").first().locator("button");
  await expect(markers).toHaveCount(3);

  for (let index = 0; index < 3; index += 1) {
    const markerBox = await markers.nth(index).boundingBox();
    const cardBox = await cards.nth(index).boundingBox();
    expect(markerBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    const markerCenter = markerBox!.y + markerBox!.height / 2;
    const cardCenter = cardBox!.y + cardBox!.height / 2;
    expect(Math.abs(markerCenter - cardCenter)).toBeLessThan(2);
  }
});
