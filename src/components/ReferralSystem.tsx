import React, { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import "../styles/ReferralSystem.scss";
import { db } from "../firebase";
import Loader from "./Loader";

interface ReferralSystemProps {
  userId: string | null;
}

interface Referral {
  id: string;
  coinsGiven: number;
  name: string | null; // Новое поле для имени
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ userId }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const referralLink = `https://t.me/VoteForGeorge_bot?start=${userId}`; // Замените `your_bot_username` на имя вашего бота
  const [isLoading, setIsLoading] = useState(true); // Добавлено состояние для загрузки

  // Получение данных о приглашённых пользователях
  useEffect(() => {
    const fetchReferrals = async () => {
      if (!userId) return;

      const userRef = ref(db, `users/${userId}/referrals`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const referralsData = snapshot.val();
        const referralsList = Object.entries(referralsData).map(([id, coinsGiven]) => ({
          id,
          coinsGiven: coinsGiven as number,
          name: null, // Имя будет загружено позже
        }));

        // Загружаем имена пользователей
        const updatedReferrals = await Promise.all(
          referralsList.map(async (referral) => {
            const userSnapshot = await get(ref(db, `users/${referral.id}`));
            const userData = userSnapshot.val();
            return {
              ...referral,
              name: userData?.name || `ID: ${referral.id}`, // Имя пользователя или fallback к ID
            };
          })
        );

        setReferrals(updatedReferrals);
        setIsLoading(false); // Данные загружены
      }
    };

    fetchReferrals();
  }, [userId]);

  // Копирование ссылки в буфер обмена
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <div className="referral-system-container">
      {isLoading ? (
        <Loader></Loader>
      )  : (
        <>
        
          <h2>Реферальная система</h2>
          <p className="referral-description">
            За каждого приглашённого пользователя вы получите 5% от его монет. Поделитесь ссылкой и начните зарабатывать!
          </p>
          <button onClick={handleCopyLink} className="copy-link-button">
            Скопировать реферальную ссылку
          </button>
    
          <h3>Приглашённые пользователи</h3>
          {referrals.length > 0 ? (
            <div className="referral-list">
              {referrals.map((referral) => (
                <div key={referral.id} className="referral-item">
                  <span className="referral-user-name">
                    {referral.name}
                  </span>
                  <span className="referral-coins">
                    Монет добавлено: {referral.coinsGiven}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="referral-description">
              У вас пока нет приглашённых пользователей.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ReferralSystem;
