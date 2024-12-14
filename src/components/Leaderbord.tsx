import React, { useState, useEffect } from "react";
import "../styles/Leaderbord.scss";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import formatNumber from '../utils/formatNumber';
import Loader from "./Loader";

interface User {
  id: string;
  name: string;
  coins: number;
}

interface LeaderboardProps {
  userId: string | null; // ID текущего пользователя
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserIndex, setCurrentUserIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Добавлено состояние для загрузки

  useEffect(() => {
    const usersRef = ref(db, "users");

    // Подписываемся на обновления данных пользователей
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray: User[] = Object.entries(data).map(([id, userData]: any) => ({
          id,
          name: userData.name || "Безымянный",
          coins: userData.coins || 0,
        }));

        // Сортируем пользователей по количеству коинов (по убыванию)
        const sortedUsers = usersArray.sort((a, b) => b.coins - a.coins);

        setUsers(sortedUsers);

        // Находим текущего пользователя и его позицию
        if (userId) {
          const foundUserIndex = sortedUsers.findIndex((user) => user.id === userId);
          setCurrentUserIndex(foundUserIndex >= 0 ? foundUserIndex + 1 : null); // Индекс начинается с 0, поэтому добавляем 1
          setCurrentUser(foundUserIndex >= 0 ? sortedUsers[foundUserIndex] : null);
        }
        setIsLoading(false); // Данные загружены
      }
    });
  }, [userId]);

  return (
    <div className="leaderboard-container">
      {isLoading ? (
        <Loader></Loader>
      ) : (
        <>
        
          <h1>Таблица лидеров</h1>
          <div className="leaderboard-list">
            {users.slice(0, 25).map((user, index) => (
              <div
                key={user.id}
                className={`leaderboard-item ${
                  user.id === userId ? "current-user" : ""
                }`}
              >
                <span
                  className={`leaderboard-rank ${
                    user.id === userId ? "current-user-rank" : ""
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`leaderboard-name ${
                    user.id === userId ? "current-user-name" : ""
                  }`}
                >
                  {user.name}
                </span>
                <span
                  className={`leaderboard-coins ${
                    user.id === userId ? "current-user-coins" : ""
                  }`}
                >
                  {formatNumber(user.coins)} монет
                </span>
              </div>
            ))}
            {currentUser && currentUserIndex && currentUserIndex > 25 && (
              <div className="leaderboard-item current-user">
                <span className="leaderboard-rank current-user-rank">
                  {currentUserIndex}
                </span>
                <span className="leaderboard-name current-user-name">
                  {currentUser.name}
                </span>
                <span className="leaderboard-coins current-user-coins">
                  {formatNumber(currentUser.coins)} монет
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
