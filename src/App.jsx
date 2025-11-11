import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import MainTab from './components/MainTab.jsx';
import TestTab from './components/TestTab.jsx';
import SavedTab from './components/SavedTab.jsx';
import { translations } from './utils/translations.js';
import { loadFromStorage, saveToStorage, storageKeys } from './utils/localStorage.js';

const TAB_IDS = {
  MAIN: 'main',
  TRAVEL: 'travel',
  TEST: 'test',
  SAVED: 'saved',
};

export default function App() {
  const [language, setLanguage] = useState(() => loadFromStorage(storageKeys.language, 'ko'));
  const [activeTab, setActiveTab] = useState(TAB_IDS.MAIN);
  const [savedRestaurants, setSavedRestaurants] = useState(() => loadFromStorage(storageKeys.savedRestaurants, []));
  const [testResult, setTestResult] = useState(() => loadFromStorage(storageKeys.testResult));
  const [focusRestaurant, setFocusRestaurant] = useState(null);
  const [keywordFilters, setKeywordFilters] = useState([]);
  const t = translations[language];

  useEffect(() => {
    saveToStorage(storageKeys.language, language);
  }, [language]);

  useEffect(() => {
    saveToStorage(storageKeys.savedRestaurants, savedRestaurants);
  }, [savedRestaurants]);

  useEffect(() => {
    if (testResult) {
      saveToStorage(storageKeys.testResult, testResult);
    }
  }, [testResult]);

  const tabs = useMemo(
    () => [
      { id: TAB_IDS.MAIN, label: t.tabs.main, icon: '📍' },
      { id: TAB_IDS.TRAVEL, label: t.tabs.travel, icon: '🗺️' },
      { id: TAB_IDS.TEST, label: t.tabs.test, icon: '🧪' },
      { id: TAB_IDS.SAVED, label: t.tabs.saved, icon: '📑' },
    ],
    [t.tabs.main, t.tabs.saved, t.tabs.test, t.tabs.travel]
  );

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'ko' ? 'en' : 'ko'));
  };

  const handleSaveRestaurant = (restaurant) => {
    setSavedRestaurants((prev) => {
      if (prev.some((item) => item.id === restaurant.id)) {
        alert(language === 'ko' ? '이미 저장한 맛집이에요!' : 'This restaurant is already saved.');
        return prev;
      }
      const updated = [restaurant, ...prev];
      alert(t.common.savedSuccess);
      return updated;
    });
  };

  const handleDeleteRestaurant = (restaurant) => {
    if (!window.confirm(t.common.deleteConfirm)) return;
    setSavedRestaurants((prev) => prev.filter((item) => item.id !== restaurant.id));
  };

  const handleUpdateRestaurant = (updatedRestaurant) => {
    setSavedRestaurants((prev) =>
      prev.map((item) => (item.id === updatedRestaurant.id ? { ...item, ...updatedRestaurant } : item))
    );
  };

  const handleImportData = (data) => {
    if (!Array.isArray(data)) {
      alert(language === 'ko' ? '올바른 JSON 형식이 아니에요.' : 'Invalid JSON format.');
      return;
    }
    setSavedRestaurants((prev) => {
      const mergedMap = new Map(prev.map((item) => [item.id, item]));
      data.forEach((item) => {
        if (item?.id) {
          mergedMap.set(item.id, { ...mergedMap.get(item.id), ...item });
        }
      });
      return Array.from(mergedMap.values());
    });
  };

  const handleApplyResult = (result) => {
    if (!result) return;
    setTestResult((prev) => ({
      ...(prev ?? {}),
      ...result,
    }));
    setKeywordFilters(result.keywords ?? []);
    setActiveTab(TAB_IDS.MAIN);
  };

  const handleSaveResult = (payload) => {
    if (!payload) return;
    setTestResult((prev) => ({
      ...(prev ?? {}),
      ...(payload.result ?? {}),
      key: payload.key ?? prev?.key,
      answers: payload.answers ?? prev?.answers,
      timestamp: payload.timestamp ?? prev?.timestamp,
    }));
  };

  const handleFocusOnMap = (restaurant) => {
    setFocusRestaurant(restaurant);
    setActiveTab(TAB_IDS.MAIN);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case TAB_IDS.MAIN:
        return (
          <MainTab
            language={language}
            t={t}
            onSaveRestaurant={handleSaveRestaurant}
            savedRestaurants={savedRestaurants}
            focusRestaurant={focusRestaurant}
            onClearFocus={() => setFocusRestaurant(null)}
            keywordFilters={keywordFilters}
            onClearKeywords={() => setKeywordFilters([])}
          />
        );
      case TAB_IDS.TEST:
        return (
          <TestTab
            language={language}
            t={t}
            onApplyResult={handleApplyResult}
            onSaveResult={(data) => handleSaveResult({ ...data, timestamp: new Date().toISOString() })}
            previousResult={testResult}
          />
        );
      case TAB_IDS.SAVED:
        return (
          <SavedTab
            language={language}
            t={t}
            savedRestaurants={savedRestaurants}
            onDelete={handleDeleteRestaurant}
            onUpdate={handleUpdateRestaurant}
            onFocusOnMap={handleFocusOnMap}
            onImport={handleImportData}
          />
        );
      case TAB_IDS.TRAVEL:
        return <TravelTab language={language} />;
      default:
        return null;
    }
  };

  return (
    <div className={`app theme-${language}`}>
      <Header
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleLanguage={handleToggleLanguage}
        languageLabel={language === 'ko' ? t.common.english : t.common.korean}
      />
      <main className="app-content">{renderActiveTab()}</main>
    </div>
  );
}

function TravelTab({ language }) {
  return (
    <section className="travel-tab">
      <div className="panel">
        <h2>{language === 'ko' ? '여행 여명: 테마별 미식 일정' : 'Travel Dawn: Curated Culinary Trails'}</h2>
        <p className="panel__description">
          {language === 'ko'
            ? '여행지 주변의 감각적인 맛집 코스를 구성해보세요. 랜덤 추천과 저장 기능을 조합하면 나만의 미식 여행이 완성됩니다.'
            : 'Design thematic food journeys around your destination. Combine random picks and saved spots to craft a memorable foodie trip.'}
        </p>
        <ul className="travel-ideas">
          <li>
            <strong>{language === 'ko' ? '아침 여명 코스' : 'Sunrise Bites'}</strong>
            <span>
              {language === 'ko'
                ? '브런치와 카페를 중심으로 여유로운 하루를 시작해보세요.'
                : 'Start with brunch and a cozy cafe to ease into the day.'}
            </span>
          </li>
          <li>
            <strong>{language === 'ko' ? '미식 탐험 코스' : 'Explorer Course'}</strong>
            <span>
              {language === 'ko'
                ? '이색 글로벌 퀴진을 중심으로 색다른 경험을 채워보세요.'
                : 'Fill your itinerary with adventurous global cuisine and hidden gems.'}
            </span>
          </li>
          <li>
            <strong>{language === 'ko' ? '야경과 함께' : 'Night View Pairing'}</strong>
            <span>
              {language === 'ko'
                ? '야경 명소 주변의 분위기 좋은 레스토랑과 펍을 연결해보세요.'
                : 'Pair scenic night spots with romantic restaurants and stylish pubs.'}
            </span>
          </li>
        </ul>
        <p className="panel__footer">
          {language === 'ko'
            ? '저장한 맛집을 기반으로 지도에서 이동 경로를 확인하고 친구와 공유해보세요.'
            : 'Use your saved list to map a route and share it with friends for instant inspiration.'}
        </p>
      </div>
    </section>
  );
}
