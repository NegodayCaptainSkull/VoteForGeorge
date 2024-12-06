import React, { useState } from "react";
import "../styles/Move.scss"; // Убедитесь, что у вас есть файл стилей для этого компонента
import formatNumber from '../utils/formatNumber';

interface MoveProps {
  userSchoolCoins: number; // количество schoolCoin у пользователя
  userRebirthCoins: number; // количество rebirth монет у пользователя
  schoolCoinsMultiplyer: number;
  rebirthUpgrades: any[];
  isEnergyDrinkActive: boolean;
  isSuperBoostActive: boolean;
  onMove: (rebirthCoins: number) => void; // функция для обработки переезда
  handleBuyItem: (index: number) => void;
}

const Move: React.FC<MoveProps> = ({ userSchoolCoins, userRebirthCoins, schoolCoinsMultiplyer, rebirthUpgrades, isEnergyDrinkActive, isSuperBoostActive, onMove, handleBuyItem }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Статус для открытия диалога
  const [isMoving, setIsMoving] = useState(false); // Статус, когда пользователь уже в процессе переезда
  const rebirthsCount = Math.log2(schoolCoinsMultiplyer);

  const rebirthPrice = 1000000 * Math.pow(5, rebirthsCount); // Стоимость переезда в schoolCoin
  const rebirthCoinRate = 10000 * Math.pow(5, rebirthsCount); // Курс обмена schoolCoin на rebirth монеты

  // Функция для открытия диалога
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Функция для выполнения переезда
  const handleMove = () => {
    if (userSchoolCoins >= rebirthPrice) {
      // Рассчитываем количество rebirth монет
      const rebirthCoinsGained = Math.floor(userSchoolCoins / rebirthCoinRate);
      onMove(rebirthCoinsGained); // Вызываем функцию для обновления данных о rebirth монетах
      setIsMoving(true);
      setIsDialogOpen(false); // Закрываем диалог после переезда
    } else {
    }
  };

  return (
    <div className="move-container">
      <h2>Переезд</h2>
      
      <div className="rebirth-count">
        <p>Количество переездов: {rebirthsCount}</p>
      </div>
      <div className="rebirth-multiplyer">
        <p>Множитель School Coins: {schoolCoinsMultiplyer}</p>
      </div>
      <div className="rebirth-coins">
        <p>Количество rebirth монет: {userRebirthCoins} (Max: 5000)</p>
      </div>

      <div className="move-button-container">
        <button onClick={handleOpenDialog} className="move-button">
          Переезд
        </button>
      </div>

      {isDialogOpen && !isMoving && (
        <div className="dialog">
          <div className="dialog-content">
            <h3>Ты переезжаешь в новую школу</h3>
            <p>
              Множитель <strong>School Coins</strong> становится в два раза больше,
              но ты теряешь все свои накопления и все улучшения.
            </p>
            <p>
              Стоимость переезда: <strong>{formatNumber(rebirthPrice)} School Coin</strong>
            </p>
            <p>За каждые {formatNumber(rebirthCoinRate)} School Coins ты получишь 1 rebirth монету</p>
            <button onClick={handleMove} className="move-dialog-button" disabled={userSchoolCoins < rebirthPrice}>
              Переехать
            </button>
            <button onClick={() => setIsDialogOpen(false)} className="close-dialog-button">
              Отмена
            </button>
          </div>
        </div>
      )}

      {isMoving && (
        <div className="moving-status">
          <p>Вы успешно переехали в новую школу!</p>
          <p>Вы получили {Math.floor(userSchoolCoins / rebirthCoinRate)} rebirth монет.</p>
        </div>
      )}
      <div className="shop-container">
        <h3>Магазин</h3>
        <div className="shop-items">
          {rebirthUpgrades.map((item, index) => (
            <div key={index} className="shop-item">
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <p>Цена: {formatNumber(item.price)} rebirth монет</p>
              <div>
                {(item.count || item.count === 0) && (
                    <p>Количество: {item.count}</p>
                  )}
              </div>
              <button
                onClick={() => handleBuyItem(index)}
                className="shop-buy-button"
                disabled={
                  userRebirthCoins < item.price || 
                  (index === 0 && isEnergyDrinkActive) || 
                  (index === 1 && isSuperBoostActive)
                }
              >
                Купить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Move;
