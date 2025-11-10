import React, { useMemo, useState } from 'react';
import classNames from 'classnames';

const TRAIT_TO_RESULT = {
  spicy: 'spicyHunter',
  sweet: 'instaLover',
  savory: 'comfortSeeker',
  fresh: 'healthySoul',
  comfort: 'warmSoup',
  hearty: 'valueExplorer',
  solo: 'valueExplorer',
  romantic: 'romanticGourmet',
  group: 'adventureFoodie',
  family: 'comfortSeeker',
  crunchy: 'adventureFoodie',
  soft: 'instaLover',
  chewy: 'warmSoup',
  adventure: 'adventureFoodie',
  classic: 'comfortSeeker',
  healthy: 'healthySoul',
  value: 'valueExplorer',
  premium: 'romanticGourmet',
  balanced: 'romanticGourmet',
  quick: 'valueExplorer',
  slow: 'romanticGourmet',
  shared: 'comfortSeeker',
  variety: 'adventureFoodie',
  sharing: 'comfortSeeker',
  aesthetic: 'instaLover',
  rating: 'spicyHunter',
  nearby: 'comfortSeeker',
  unique: 'adventureFoodie',
  flexible: 'adventureFoodie',
};

export default function TestTab({ language, t, onApplyResult, onSaveResult, previousResult }) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [resultKey, setResultKey] = useState(previousResult?.key ?? null);
  const questions = t.test.questions;
  const total = questions.length;

  const resultTypes = t.test.resultTypes;
  const result = useMemo(() => (resultKey ? resultTypes[resultKey] : null), [resultKey, resultTypes]);

  const handleOptionSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (current < total - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      const computed = calculateResult(answers);
      setResultKey(computed);
      setStarted(false);
      onSaveResult?.({ key: computed, answers, result: resultTypes[computed] });
    }
  };

  const handlePrevious = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const handleStart = () => {
    setStarted(true);
    setCurrent(0);
    setAnswers({});
  };

  const shareResult = async () => {
    if (!result) return;
    const shareText = `${result.title} - ${result.description}`;
    try {
      await navigator.clipboard.writeText(shareText);
      alert(language === 'ko' ? '결과를 클립보드에 복사했어요!' : 'Result copied to clipboard!');
    } catch (error) {
      console.error(error);
      alert(language === 'ko' ? '복사에 실패했어요.' : 'Failed to copy.');
    }
  };

  return (
    <section className="test-tab">
      {!started && !result && (
        <div className="panel">
          <h2>{t.test.title}</h2>
          <p className="panel__description">{t.test.subtitle}</p>
          {previousResult && (
            <button type="button" className="btn btn-outline" onClick={() => setResultKey(previousResult.key)}>
              {t.test.resume}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={handleStart}>
            {t.test.start}
          </button>
        </div>
      )}

      {started && (
        <div className="panel">
          <div className="test-progress">
            <span>
              {t.test.questionPrefix}
              {current + 1}
            </span>
            <span>{t.test.progress(current + 1, total)}</span>
          </div>

          <h3 className="test-question">{questions[current].text}</h3>
          <div className="test-options">
            {questions[current].options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={classNames('test-option', {
                  selected: answers[questions[current].id] === option.value,
                })}
                onClick={() => handleOptionSelect(questions[current].id, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="test-controls">
            <button type="button" className="btn btn-outline" onClick={handlePrevious} disabled={current === 0}>
              {t.test.prev}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!answers[questions[current].id]}
            >
              {current === total - 1 ? t.test.finish : t.test.next}
            </button>
          </div>
        </div>
      )}

      {!started && result && (
        <div className="panel result">
          <h2>{t.test.resultTitle}</h2>
          <div className="result-card">
            <h3>{result.title}</h3>
            <p>{result.description}</p>
            <div className="result-tags">
              {result.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="result-actions">
              <button type="button" className="btn btn-primary" onClick={() => onApplyResult({ ...result, key: resultKey })}>
                {t.test.findWithResult}
              </button>
              <button type="button" className="btn btn-secondary" onClick={shareResult}>
                {t.test.share}
              </button>
              <button type="button" className="btn btn-outline" onClick={handleStart}>
                {t.test.restart}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function calculateResult(answers) {
  const scoreMap = {};
  Object.values(answers).forEach((value) => {
    const key = TRAIT_TO_RESULT[value] ?? 'valueExplorer';
    scoreMap[key] = (scoreMap[key] ?? 0) + 1;
  });

  const sorted = Object.entries(scoreMap).sort(([, a], [, b]) => b - a);
  return sorted[0]?.[0] ?? 'valueExplorer';
}
