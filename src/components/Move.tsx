import React, { useState } from "react";
import "../styles/Move.scss"; // Убедитесь, что у вас есть файл стилей для этого компонента

interface MoveProps {
  userSchoolCoins: number; // количество schoolCoin у пользователя
  userRebirthCoins: number; // количество rebirth монет у пользователя
  schoolCoinsMultiplyer: number;
  onMove: (rebirthCoins: number) => void; // функция для обработки переезда
}

const Move: React.FC<MoveProps> = ({ userSchoolCoins, userRebirthCoins, schoolCoinsMultiplyer, onMove }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Статус для открытия диалога
  const [isMoving, setIsMoving] = useState(false); // Статус, когда пользователь уже в процессе переезда
  const rebirthsCount = Math.log2(schoolCoinsMultiplyer);

  const rebirthPrice = Math.pow(1000000, rebirthsCount + 1); // Стоимость переезда в schoolCoin
  const rebirthCoinRate = 10000; // Курс обмена schoolCoin на rebirth монеты

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
        <p>Количество rebirth монет: {userRebirthCoins}</p>
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
              Стоимость переезда: <strong>{rebirthPrice} School Coin</strong>
            </p>
            <p>За каждые 10 тысяч School Coins ты получишь 1 rebirth монету</p>
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
    </div>
  );
};

export default Move;
