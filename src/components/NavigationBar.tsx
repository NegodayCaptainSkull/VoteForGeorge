import React from 'react';
import '../styles/NavigationBar.scss';

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
        Кликер
      </button>
      <button
        className={`nav-button ${currentPage === 'move' ? 'active' : ''}`}
        onClick={() => setPage('move')}
      >
        Переезд
      </button>
      <button
        className={`nav-button ${currentPage === 'leaderboard' ? 'active' : ''}`}
        onClick={() => setPage('leaderboard')}
      >
        Лидеры
      </button>
      <button
        className={`nav-button ${currentPage === 'referral' ? 'active' : ''}`}
        onClick={() => setPage('referral')}
      >
        Реферальная система
      </button>
    </div>
  );
};

export default NavigationBar;
