import React, { useState } from 'react';
import classNames from 'classnames';

export default function RestaurantCard({
  restaurant,
  language,
  labels,
  actions = [],
  onSave,
  isSaved,
}) {
  if (!restaurant) {
    return null;
  }

  const { name, address, category, rating, phone, hours, menu, description } = restaurant;
  const [expanded, setExpanded] = useState(true);

  return (
    <article className="restaurant-card" aria-label={name}>
      <header className="restaurant-card__header">
        <h3>{name}</h3>
        {category && <span className="restaurant-card__tag">{category}</span>}
      </header>
      <p className="restaurant-card__address">{address}</p>
      {description && <p className="restaurant-card__description">{description}</p>}

      <button
        type="button"
        className="restaurant-card__toggle"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        {expanded
          ? language === 'ko'
            ? '세부 정보 숨기기'
            : 'Hide details'
          : language === 'ko'
          ? '세부 정보 보기'
          : 'Show details'}
      </button>

      {expanded && (
        <dl className="restaurant-card__meta">
          {rating && (
            <div>
              <dt>{labels.rating}</dt>
              <dd>
                <span className="stars" aria-hidden="true">
                  {'★'.repeat(Math.round(rating))}
                  {'☆'.repeat(5 - Math.round(rating))}
                </span>
                <span className="sr-only">{rating}</span>
              </dd>
            </div>
          )}
          {phone && (
            <div>
              <dt>{labels.phone}</dt>
              <dd>
                <a href={`tel:${phone}`} className="link">
                  {phone}
                </a>
              </dd>
            </div>
          )}
          {hours && (
            <div>
              <dt>{labels.hours}</dt>
              <dd>{hours}</dd>
            </div>
          )}
          {menu && (
            <div>
              <dt>{labels.menu}</dt>
              <dd>{menu}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="restaurant-card__actions">
        {actions.map((action) =>
          action.type === 'link' ? (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={classNames('btn', action.variant ? `btn-${action.variant}` : 'btn-outline')}
            >
              {action.label}
            </a>
          ) : (
            <button
              key={action.label}
              type="button"
              className={classNames('btn', action.variant ? `btn-${action.variant}` : 'btn-secondary')}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          )
        )}
        {onSave && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onSave}
            disabled={isSaved}
          >
            {isSaved ? (language === 'ko' ? '이미 저장됨' : 'Saved') : labels.save}
          </button>
        )}
      </div>
    </article>
  );
}
