import React from 'react';
import '../styles/NavigationBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMousePointer, faTruck, faCrown, faLink } from '@fortawesome/free-solid-svg-icons'; // Импорты иконок

interface NavigationBarProps {
  currentPage: string;
  setPage: (page: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ currentPage, setPage }) => {
  return (
    <div className="navigation-bar">
      <button
        className={`nav-button ${currentPage === 'clicker' ? 'active' : ''}`}
        onClick={() => setPage('clicker')}
      >
        <FontAwesomeIcon icon={faMousePointer} size="2x" /> {/* Иконка для "Кликера" */}
      </button>
      <button
        className={`nav-button ${currentPage === 'move' ? 'active' : ''}`}
        onClick={() => setPage('move')}
      >
        <FontAwesomeIcon icon={faTruck} size="2x" /> {/* Иконка для "Переезда" */}
      </button>
      <button
        className={`nav-button ${currentPage === 'leaderboard' ? 'active' : ''}`}
        onClick={() => setPage('leaderboard')}
      >
        <FontAwesomeIcon icon={faCrown} size="2x" /> {/* Иконка для "Лидеров" */}
      </button>
      <button
        className={`nav-button ${currentPage === 'referral' ? 'active' : ''}`}
        onClick={() => setPage('referral')}
      >
        <FontAwesomeIcon icon={faLink} size="2x" /> {/* Иконка для "Реферальной системы" */}
      </button>
    </div>
  );
};

export default NavigationBar;
