import React from 'react';
import classNames from 'classnames';

export default function Header({ tabs, activeTab, onTabChange, onToggleLanguage, languageLabel }) {
  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="app-logo">🍽️</span>
        <div>
          <h1 className="app-title">RandRes</h1>
          <p className="app-subtitle">Naver Maps Random Restaurant Explorer</p>
        </div>
      </div>
      <nav className="tab-navigation" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={classNames('tab-button', { active: activeTab === tab.id })}
          >
            <span role="presentation" aria-hidden="true" className="tab-icon">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
        <button type="button" className="tab-button language" onClick={onToggleLanguage}>
          <span role="presentation" aria-hidden="true" className="tab-icon">
            🌐
          </span>
          <span>{languageLabel}</span>
        </button>
      </nav>
    </header>
  );
}
