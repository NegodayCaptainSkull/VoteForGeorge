import React, { useState, useEffect } from 'react';
import '../styles/Clicker.scss';
import { ref, update, onValue } from 'firebase/database';
import { db } from '../firebase';

interface Upgrade {
  name: string;
  baseCost: number;
  costMultiplier: number;
  cps: number; // Монеты в секунду
  count: number;
}

interface ClickUpgrade {
  level: number;
  cost: number;
}

interface ClickerProps {
  userId: string | null; // Указываем, что name всегда будет строкой
}

const upgradesData: Upgrade[] = [
  { name: 'Учебник', baseCost: 15, costMultiplier: 1.15, cps: 0.1, count: 0 },
  { name: 'Учитель', baseCost: 100, costMultiplier: 1.15, cps: 1, count: 0 },
  { name: 'Класс', baseCost: 1100, costMultiplier: 1.15, cps: 8, count: 0 },
  { name: 'Студент-ассистент', baseCost: 12000, costMultiplier: 1.15, cps: 47, count: 0 },
  { name: 'Школьный комитет', baseCost: 130000, costMultiplier: 1.15, cps: 260, count: 0 },
  { name: 'Директор школы', baseCost: 1400000, costMultiplier: 1.15, cps: 1400, count: 0 },
  { name: 'Руководитель образования', baseCost: 20000000, costMultiplier: 1.15, cps: 7800, count: 0 },
  { name: 'Министр образования', baseCost: 330000000, costMultiplier: 1.15, cps: 44000, count: 0 },
];

const Clicker: React.FC<ClickerProps> = ({ userId }) => {
  const userRef = ref(db, `users/${userId}`);

  const [coins, setCoins] = useState(0);
  const [cps, setCps] = useState(0); // Монеты в секунду
  const [upgrades, setUpgrades] = useState<Upgrade[]>(upgradesData);
  const [coinsPerClick, setCoinsPerClick] = useState(1); // Начальные монеты за клик
  const [clickPowerUpgrades, setClickPowerUpgrades] = useState<ClickUpgrade>({
    level: 1,
    cost: 50,
  });

  // Загрузка данных пользователя из Firebase
  useEffect(() => {
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCoins(data.coins || 0);
        setCps(data.cps || 0);
        setUpgrades(data.upgrades || upgradesData);
        setCoinsPerClick(data.coinsPerClick || 1);
        setClickPowerUpgrades(data.clickPowerUpgrades || { level: 1, cost: 50 });
      }
    });
  }, [userRef]);

  // Сохраняем данные каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      const userData = {
        coins,
        cps,
        upgrades,
        coinsPerClick,
        clickPowerUpgrades,
      };
  
      // Используем update, чтобы обновить только изменённые поля
      update(userRef, userData);
    }, 5000);

    return () => clearInterval(interval); // Очистка интервала при размонтировании
  }, [coins, cps, upgrades, coinsPerClick, clickPowerUpgrades, userRef]);

  // Увеличиваем монеты в зависимости от CPS каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prevCoins) => prevCoins + cps);
    }, 1000);
    return () => clearInterval(interval);
  }, [cps]);

  // Обработка клика для получения монет
  const handleClick = () => {
    setCoins(coins + coinsPerClick);
  };

  const buyClickPowerUpgrade = () => {
    if (coins >= clickPowerUpgrades.cost) {
      setCoins(coins - clickPowerUpgrades.cost); // Вычитаем стоимость
      setCoinsPerClick(coinsPerClick + 1); // Увеличиваем монеты за клик
      setClickPowerUpgrades({
        level: clickPowerUpgrades.level + 1,
        cost: Math.floor(clickPowerUpgrades.cost * 1.5), // Увеличиваем стоимость для следующего уровня
      });
    }
  };

  // Покупка апгрейда
  const purchaseUpgrade = (index: number) => {
    const upgrade = upgrades[index];
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
    if (coins >= cost) {
      setCoins(coins - cost);
      const newUpgrades = [...upgrades];
      newUpgrades[index] = { ...upgrade, count: upgrade.count + 1 };
      setUpgrades(newUpgrades);
      setCps(cps + upgrade.cps);
    }
  };

  return (
    <div className="clicker-container">
      <h1>School Coin</h1>
      <p className="coins">Монеты: {coins.toFixed(1)}</p>
      <p className="cps">Монеты в секунду (CPS): {cps.toFixed(1)}</p>
      <div
        className='coin'
        onClick={handleClick}
        onMouseDown={(e) => e.preventDefault()} // Для предотвращения выделения текста при нажатии
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
      </div>
      <div className="upgrades">
        <h2>Апгрейды</h2>
        <div className="click-power">
          <p>Улучшение клика</p>
          <button onClick={buyClickPowerUpgrade} className="upgrade-button">
            Купить улучшение клика (Уровень {clickPowerUpgrades.level}) - Стоимость: {clickPowerUpgrades.cost} монет
          </button>
        </div>
        {upgrades.map((upgrade, index) => (
          <div key={index} className="upgrade-item">
            <h3>{upgrade.name}</h3>
            <p>Стоимость: {Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count))} монет</p>
            <p>Монет в секунду: {upgrade.cps}</p>
            <p>Количество: {upgrade.count}</p>
            <button onClick={() => purchaseUpgrade(index)} className="upgrade-button">
              Купить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clicker;
