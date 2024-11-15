import React, { useState, useEffect } from 'react';
import '../styles/Clicker.scss';

const Clicker: React.FC = () => {
  const [coins, setCoins] = useState(0);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  const [autoFarm, setAutoFarm] = useState(0);

  // Обновляем монеты автоматически
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prev) => prev + autoFarm);
    }, 1000);
    return () => clearInterval(interval);
  }, [autoFarm]);

  const handleClick = () => {
    setCoins(coins + coinsPerClick);
  };

  const upgradeClick = () => {
    if (coins >= 10) {
      setCoins(coins - 10);
      setCoinsPerClick(coinsPerClick + 1);
    } else {
      alert('Недостаточно монет!');
    }
  };

  const upgradeAutoFarm = () => {
    if (coins >= 50) {
      setCoins(coins - 50);
      setAutoFarm(autoFarm + 1);
    } else {
      alert('Недостаточно монет!');
    }
  };

  return (
    <div className="clicker">
      <h1>SchoolCoin Кликер</h1>
      <p>Монеты: {coins}</p>
      <button onClick={handleClick}>Кликнуть</button>
      <div className="upgrades">
        <button onClick={upgradeClick}>Улучшить клик (10 монет)</button>
        <button onClick={upgradeAutoFarm}>Автофарм (50 монет)</button>
      </div>
    </div>
  );
};

export default Clicker;
