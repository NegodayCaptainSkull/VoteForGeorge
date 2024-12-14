import React from 'react';
import '../styles/Clicker.scss';
import formatNumber from '../utils/formatNumber';

interface CoinProps {
  coins: number;
  cps: number;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  energyDrinkTimer: string;
  superBoostTimer: string;
  energyDrinkActive: boolean;
  superBoostActive: boolean;
}

const Coin: React.FC<CoinProps> = ({ coins, cps, onClick, energyDrinkTimer, superBoostTimer, energyDrinkActive, superBoostActive }) => {
  return (
    <div>
      <h1>School Coin</h1>
      <p className="coins">Монеты: {formatNumber(coins)}</p>
      <p className="cps">Монеты в секунду (CPS): {cps.toFixed(1)}</p>
      <p className="warning">Оффлайн майнинг работает только 20 минут</p>
      <div className="boost-timers">
        {energyDrinkActive && (
          <div className="boost-timer">
            <p>Энергетический напиток активен: {energyDrinkTimer}</p>
          </div>
        )}
        {superBoostActive && (
          <div className="boost-timer">
            <p>Суперускорение активно: {superBoostTimer}</p>
          </div>
        )}
      </div>
      <div
        className={`coin ${cps > 0 ? 'pulsing' : ''}`} // Добавление класса pulsing, если cps > 0
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()} // Предотвращение выделения текста
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      />
    </div>
  );
};

export default Coin;
