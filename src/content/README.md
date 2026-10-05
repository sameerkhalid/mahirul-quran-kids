# Editing Qur'an content and questions

Everything intended for manual editing is in this directory. UI components never contain Qur'anic text.

## Correct an ayah

Open the surah file in `surahs/`, find its `verseKey`, and update `textQpcHafs`. Keep the verse key, surah number, and ayah number unchanged unless you are correcting the structure itself.

## Add a question

Open the matching file in `questions/`, copy an entry of the desired `type`, and give it a unique lowercase `id`. Questions refer to ayahs by keys such as `112:1`; do not copy Arabic text into a question.

Available types:

- `choose-next-ayah`: `promptAyahKey`, `correctAyahKey`, and optional `distractorAyahKeys`.
- `identify-surah`: `ayahKey` and `correctSurahNumber`.
- `arrange-ayahs`: three or four consecutive keys in `correctOrder`.
- `recite-next`: `promptAyahKey` and `answerAyahKey`.

`match-surah-meanings` questions are generated whenever at least three surahs are selected. Their editable meanings come from each surah file's `meaningEnglish` field.

Set `enabled` to `false` to keep an entry without offering it in quizzes. `difficulty` is `1`, `2`, or `3`. Use `note` for an editor-facing explanation.

Cross-surah questions belong in `questions/cross-surah.json`.

## Audio

Add a local MP3 under `public/audio/` and map its verse key in `audio-manifest.json`.

## Check your edits

Run:

```sh
pnpm validate:content
```

The validator reports the relevant file or question ID and does not rewrite content.
