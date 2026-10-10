/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isQuiz, isQuizSummaryList, MIN_QUESTIONS_PER_QUIZ } from './quizValidation';

const DATA_DIR = join(process.cwd(), 'public/mock-api/quizzes');
const readJson = (file: string): unknown => JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));

describe('mock quiz data', () => {
  const index = readJson('index.json');
  const quizFiles = readdirSync(DATA_DIR).filter((file) => file !== 'index.json');

  it('has a valid catalog index', () => {
    expect(isQuizSummaryList(index)).toBe(true);
  });

  it('has a quiz file for every catalog entry, and no orphans', () => {
    const ids = (index as { id: string }[]).map((entry) => `${entry.id}.json`).sort();
    expect(quizFiles.sort()).toEqual(ids);
  });

  for (const file of quizFiles) {
    it(`${file} is a valid quiz that matches its catalog entry`, () => {
      const quiz = readJson(file);
      expect(isQuiz(quiz)).toBe(true);
      const { questions, ...summary } = quiz as { questions: unknown[] };
      expect(questions.length).toBeGreaterThanOrEqual(MIN_QUESTIONS_PER_QUIZ);
      const entry = (index as { id: string }[]).find((item) => `${item.id}.json` === file);
      expect(summary).toEqual(entry);
    });
  }
});
