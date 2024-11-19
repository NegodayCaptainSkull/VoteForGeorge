import React, { useState } from "react";
import "../styles/Move.scss"; // Убедитесь, что у вас есть файл стилей для этого компонента

interface MoveProps {
  userSchoolCoins: number; // количество schoolCoin у пользователя
  userRebirthCoins: number; // количество rebirth монет у пользователя
  onMove: (rebirthCoins: number) => void; // функция для обработки переезда
}

const Move: React.FC<MoveProps> = ({ userSchoolCoins, userRebirthCoins, onMove }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Статус для открытия диалога
  const [isMoving, setIsMoving] = useState(false); // Статус, когда пользователь уже в процессе переезда

  const schoolCoinPrice = 1000000; // Стоимость переезда в schoolCoin
  const rebirthCoinRate = 10000; // Курс обмена schoolCoin на rebirth монеты

  // Функция для открытия диалога
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Функция для выполнения переезда
  const handleMove = () => {
    if (userSchoolCoins >= schoolCoinPrice) {
      // Рассчитываем количество rebirth монет
      const rebirthCoinsGained = Math.floor(userSchoolCoins / rebirthCoinRate);
      onMove(rebirthCoinsGained); // Вызываем функцию для обновления данных о rebirth монетах
      setIsMoving(true);
      setIsDialogOpen(false); // Закрываем диалог после переезда
    } else {
      alert("У вас недостаточно schoolCoin для переезда.");
    }
  };

  return (
    <div className="move-container">
      <h2>Переезд</h2>
      
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
              Множитель <strong>schoolCoins</strong> становится в два раза больше,
              но ты теряешь все свои накопления и все улучшения.
            </p>
            <p>
              Стоимость переезда: <strong>{schoolCoinPrice} schoolCoin</strong>
            </p>
            <button onClick={handleMove} className="move-dialog-button">
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
