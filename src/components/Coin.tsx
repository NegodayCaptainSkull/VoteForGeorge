import React from 'react';
import '../styles/Clicker.scss';

interface CoinProps {
  coins: number;
  cps: number;
  onClick: () => void;
}

const Coin: React.FC<CoinProps> = ({ coins, cps, onClick }) => {
  return (
    <div>
      <h1>School Coin</h1>
      <p className="coins">Монеты: {coins.toFixed(1)}</p>
      <p className="cps">Монеты в секунду (CPS): {cps.toFixed(1)}</p>
      <div
        className="coin"
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()} // Предотвращение выделения текста
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      ></div>
    </div>
  );
};

export default Coin;
