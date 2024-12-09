import React, { useEffect, useState } from 'react';
import { ref, get } from "firebase/database";
import '../styles/ReferralSystem.scss';
import { db } from '../firebase';

interface ReferralSystemProps {
  userId: string | null;
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ userId }) => {
  const [referrals, setReferrals] = useState<{ id: string; coinsGiven: number }[]>([]);
  const referralLink = `https://t.me/VoteForGeorge_bot?start=${userId}`; // Замените `your_bot_username` на имя вашего бота

  // Получение данных о приглашённых пользователях
  useEffect(() => {
    const fetchReferrals = async () => {
      const userRef = ref(db, `users/${userId}/referrals`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const referralsData = snapshot.val();
        const referralsList = Object.entries(referralsData).map(([id, coinsGiven]) => ({
          id,
          coinsGiven: coinsGiven as number,
        }));
        setReferrals(referralsList);
      }
    };

    fetchReferrals();
  }, [userId]);

  // Копирование ссылки в буфер обмена
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
  };

  return (
    <div className="referral-system-container">
      <h2>Реферальная система</h2>
      <p className="referral-description">
        За каждого приглашённого пользователя вы получите 5% от его монет. Поделитесь ссылкой и начните зарабатывать!
      </p>
      <button onClick={handleCopyLink} className="copy-link-button">
        Скопировать реферальную ссылку
      </button>
      <p className="referral-description">Ваша реферальная ссылка: {referralLink}</p>

      <h3>Приглашённые пользователи</h3>
      {referrals.length > 0 ? (
        <div className="referral-list">
          {referrals.map((referral) => (
            <div key={referral.id} className="referral-item">
              <span className="referral-user-id">Пользователь ID: {referral.id}</span>
              <span className="referral-coins">Монет добавлено: {referral.coinsGiven}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="referral-description">У вас пока нет приглашённых пользователей.</p>
      )}
    </div>
  );
};

export default ReferralSystem;
