import React, { useCallback, useEffect, useRef, useState } from 'react';
import Clicker from './components/Clicker';
import { useSearchParams } from 'react-router-dom';
import Account from './components/Account';
import './styles/App.scss';
import Leaderboard from './components/Leaderbord';
import NavigationBar from './components/NavigationBar';
import Move from './components/Move';
import { onValue, ref, update, get } from 'firebase/database';
import { db } from './firebase';
import formatNumber from './utils/formatNumber';
import ReferralSystem from './components/ReferralSystem';
import Loader from './components/Loader';

const App: React.FC = () => {

  const [searchParams] = useSearchParams()

  const name = searchParams.get('name') || 'Гость';
  const username = searchParams.get('username');
  const userId = searchParams.get('id');

  const [currentPage, setCurrentPage] = useState<string>('clicker');

  const userRef = useRef(ref(db, `users/${userId}`));

  // Состояния
  const [coins, setCoins] = useState(0);
  const [rebirthCoins, setRebirthCoins] = useState(0);
  const [schoolCoinsMultiplyer, setSchoolCoinsMultiplyer] = useState(1);
  const [cps, setCps] = useState(0);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  const [upgrades, setUpgrades] = useState([
    { name: 'Учебник', baseCost: 15, costMultiplier: 1.15, cps: 0.1, count: 0 },
    { name: 'Учитель', baseCost: 100, costMultiplier: 1.15, cps: 1, count: 0 },
    { name: 'Класс', baseCost: 1100, costMultiplier: 1.15, cps: 8, count: 0 },
    { name: 'Студент-ассистент', baseCost: 12000, costMultiplier: 1.15, cps: 47, count: 0 },
    { name: 'Школьный комитет', baseCost: 130000, costMultiplier: 1.15, cps: 260, count: 0 },
    { name: 'Директор школы', baseCost: 1400000, costMultiplier: 1.15, cps: 1400, count: 0 },
    { name: 'Руководитель образования', baseCost: 20000000, costMultiplier: 1.15, cps: 7800, count: 0 },
    { name: 'Министр образования', baseCost: 330000000, costMultiplier: 1.15, cps: 44000, count: 0 },
    { name: 'Образовательная корпорация', baseCost: 5100000000, costMultiplier: 1.15, cps: 240000, count: 0 },
    { name: 'Международная академия', baseCost: 75000000000, costMultiplier: 1.15, cps: 1300000, count: 0 },
    { name: 'Университет будущего', baseCost: 1000000000000, costMultiplier: 1.15, cps: 7200000, count: 0 },
    { name: 'Искусственный интеллект-репетитор', baseCost: 14000000000000, costMultiplier: 1.15, cps: 42000000, count: 0 },
    { name: 'Мировой совет образования', baseCost: 200000000000000, costMultiplier: 1.15, cps: 240000000, count: 0 }
  ]);
  const [rebirthUpgrades, setRebirthUpgrades] = useState([
    {name: "Энергетический напиток", description: "x2 монет за клик на 10 минут", price: 20},
    {name: "Суперускорение", description: "x2 монет в секунду на 10 минут", price: 20},
    {name: "Машина времени", description: "Симулирует 10 минут игры", price: 100},
    {name: "Быстрый старт", description: "Начинайте с 1000 School Coins после переезда", price: 30, count: 0 },
  ])
  const [clickPowerUpgrades, setClickPowerUpgrades] = useState({ level: 1, cost: 50 });

  const [energyDrinkActive, setEnergyDrinkActive] = useState(false);
  const [superBoostActive, setSuperBoostActive] = useState(false);

  const [energyDrinkTimeLeft, setEnergyDrinkTimeLeft] = useState<number>(0);
  const [superBoostTimeLeft, setSuperBoostTimeLeft] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(true); // Добавлено состояние для загрузки
  
  // Ссылки на состояния
  const nameRef = useRef(name);
  const userNameRef = useRef(username);
  const coinsRef = useRef(coins);
  const cpsRef = useRef(cps);
  const upgradesRef = useRef(upgrades);
  const coinsPerClickRef = useRef(coinsPerClick);
  const clickPowerUpgradesRef = useRef(clickPowerUpgrades);

  useEffect(() => {
    coinsRef.current = coins;
    cpsRef.current = cps;
    upgradesRef.current = upgrades;
    coinsPerClickRef.current = coinsPerClick;
    clickPowerUpgradesRef.current = clickPowerUpgrades;
  }, [coins, cps, upgrades, coinsPerClick, clickPowerUpgrades]);

  // Логика загрузки данных из Firebase
  useEffect(() => {
    if (userId) {
      const userRef = ref(db, `users/${userId}`);

      const unsubscribe = onValue(userRef, async (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCoins(data.coins || 0);
          setRebirthCoins(data.rebirthCoins || 0);
          setSchoolCoinsMultiplyer(data.schoolCoinsMultiplyer || 1);
          setCps(data.cps || 0);
          setUpgrades(data.upgrades || []);
          setCoinsPerClick(data.coinsPerClick || 1);
          setClickPowerUpgrades(data.clickPowerUpgrades || { level: 1, cost: 50 });
          setRebirthUpgrades(
            data.rebirthUpgrades || [
              { name: "Энергетический напиток", description: "x2 монет за клик на 10 минут", price: 20 },
              { name: "Суперускорение", description: "x2 монет в секунду на 10 минут", price: 20 },
              { name: "Машина времени", description: "Симулирует 10 минут игры", price: 100 },
              { name: "Быстрый старт", description: "Начинайте с 1000 School Coins после переезда", price: 30, count: 0 },
            ]
          );

          const now = Date.now();
          if (data.energyDrinkEndTime && now < data.energyDrinkEndTime) {
            const timeLeft = Math.max(data.energyDrinkEndTime - now, 0);
            setEnergyDrinkTimeLeft(timeLeft);
            setEnergyDrinkActive(true);
            setTimeout(() => setEnergyDrinkActive(false), timeLeft);
          }
          if (data.superBoostEndTime && now < data.superBoostEndTime) {
            const timeLeft = Math.max(data.superBoostEndTime - now, 0);
            setSuperBoostTimeLeft(timeLeft);
            setSuperBoostActive(true);
            setTimeout(() => setSuperBoostActive(false), timeLeft);
          }

          const lastLogoutTime = data.lastLogoutTime || 0;

          if (lastLogoutTime > 0) {
            const offlineTime = Math.min(now - lastLogoutTime, 60 * 20 * 1000); // Максимум 20 минут
            let multiplier = data.superBoostEndTime && lastLogoutTime < data.superBoostEndTime ? 2 : 1;
            const offlineCoins = Math.floor(
              (offlineTime / 1000) * (data.cps || 0) * (data.schoolCoinsMultiplyer || 1) * multiplier
            );

            if (offlineCoins > 0) {
              const newCoins = (data.coins || 0) + offlineCoins;
              if (newCoins !== data.coins) {
                setCoins(newCoins);
              }
            }
          }
        }

        setIsLoading(false); // Данные загружены
      });

      return () => unsubscribe();
    }
  }, [userId]);

  let lastSavedCoins: number | null = null; // Инициализация переменной для отслеживания изменений в монетах

  const saveProgress = useCallback(async () => {
    const currentUserRef = userRef.current;
  
    // Сохраняем данные текущего пользователя
    await update(currentUserRef, {
      name: nameRef.current,
      username: userNameRef.current,
      coins: coinsRef.current,
      cps: cpsRef.current,
      upgrades: upgradesRef.current,
      coinsPerClick: coinsPerClickRef.current,
      clickPowerUpgrades: clickPowerUpgradesRef.current,
      lastLogoutTime: Date.now(),
    });
  
    // Получаем referrer (ID того, кто пригласил текущего пользователя)
    const snapshot = await get(currentUserRef);
    const userData = snapshot.val();
    const referrerId = userData?.referrer;
  
    // Если это первый запуск, инициализируем lastSavedCoins текущим количеством монет
    if (lastSavedCoins === null) {
      lastSavedCoins = coinsRef.current;
      return; // Первый вызов завершён, не начисляем бонусы
    }
  
    // Рассчитываем количество монет, добавленных за последние 10 секунд
    const coinsGained = coinsRef.current - lastSavedCoins;
  
    // Обновляем lastSavedCoins для следующего вызова
    lastSavedCoins = coinsRef.current;
  
    // Если referrer существует и пользователь заработал монеты за последние 10 секунд, добавляем 5% от них
    if (referrerId && coinsGained > 0) {
      referralCoinsFarm(referrerId, coinsGained)
    }
  }, []);

  const referralCoinsFarm = async (referrerId: any, coinsGained: number) => {
    const referrerRef = ref(db, `users/${referrerId}`);
  
      const referrerSnapshot = await get(referrerRef);
      if (referrerSnapshot.exists()) {
        const referrerData = referrerSnapshot.val();
        const referrerCoins = referrerData.coins || 0;
        const referrals = referrerData.referrals || {};
  
        // Рассчитываем бонус: 5% от монет, добавленных за последние 10 секунд
        const bonus = Math.floor(coinsGained * 0.05); // Округляем до целого числа
  
        // Получаем текущую сумму монет, заработанных от этого реферала
        const referralGainedCoins = referrals[userId!] || 0;
  
        // Обновляем данные реферрера
        await update(referrerRef, {
          coins: referrerCoins + bonus,
          referrals: {
            ...referrals,
            [userId!]: referralGainedCoins + bonus, // Обновляем количество монет, заработанных от конкретного реферала
          },
        });
      }
  }

  // Сохранение данных в Firebase каждые 10 секунд
  useEffect(() => {
    const saveDataInterval = setInterval(() => {
      saveProgress();
    }, 10000);

    return () => clearInterval(saveDataInterval);
  }, [saveProgress]);

  // Сохранение данных перед закрытием страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveProgress]);

  useEffect(() => {
    if (energyDrinkActive) {
      const timer = setTimeout(() => setEnergyDrinkActive(false), 10 * 60 * 1000); // 10 минут
      return () => clearTimeout(timer); // Очистить таймер при размонтировании
    }
  }, [energyDrinkActive]);
  
  useEffect(() => {
    if (superBoostActive) {
      const timer = setTimeout(() => setSuperBoostActive(false), 10 * 60 * 1000); // 10 минут
      return () => clearTimeout(timer);
    }
  }, [superBoostActive]);

  // Увеличение монет от CPS каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      const multiplier = superBoostActive ? 2 : 1; // Если активен суперускоритель, умножаем на 2
      setCoins((prevCoins) => Math.round((prevCoins + cps * schoolCoinsMultiplyer * multiplier) * 10) / 10);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [cps, schoolCoinsMultiplyer, superBoostActive]);

  // Обработчики
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const multiplier = energyDrinkActive ? 2 : 1; // Если активен энергетик, умножаем на 2
    const coinsGained = coinsPerClick * schoolCoinsMultiplyer * multiplier;
  
    // Увеличиваем количество монет
    setCoins((prevCoins) => prevCoins + coinsGained);
  
    // Ограничение на количество всплывающих текстов
    const maxFloatingTexts = 3;
    const existingTexts = document.querySelectorAll('.floating-text');
    if (existingTexts.length >= maxFloatingTexts) {
      return; // Не добавляем новый текст, если их уже больше 3
    }
  
    // Получаем координаты клика относительно элемента
    const target = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - target.left; // Координата X относительно элемента
    const clickY = event.clientY - target.top; // Координата Y относительно элемента
  
    const coinsGainedText = formatNumber(coinsGained);
  
    // Создаем временный элемент
    const floatingText = document.createElement('span');
    floatingText.textContent = `+${coinsGainedText}`;
    floatingText.style.position = 'absolute';
    floatingText.style.left = `${clickX}px`;
    floatingText.style.top = `${clickY}px`;
    floatingText.style.transform = 'translate(-50%, -50%)';
    floatingText.style.color = 'rgba(0, 210, 210, 1)';
    floatingText.style.fontSize = '24px';
    floatingText.style.fontWeight = 'bold';
    floatingText.style.pointerEvents = 'none'; // Элемент не должен блокировать клики
    floatingText.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    floatingText.style.opacity = '1';
    floatingText.className = 'floating-text'; // Добавляем класс для удобства поиска
  
    // Добавляем элемент в DOM относительно текущего контейнера
    event.currentTarget.appendChild(floatingText);
  
    // Анимация: перемещение вверх и исчезновение
    setTimeout(() => {
      floatingText.style.opacity = '0';
      floatingText.style.transform = 'translate(-50%, -100%)';
    }, 0);
  
    // Удаление элемента из DOM через 0.5 секунды
    setTimeout(() => {
      if (floatingText.parentNode) {
        floatingText.parentNode.removeChild(floatingText);
      }
    }, 500);
  };
  
  const buyClickPowerUpgrade = () => {
    if (coins >= clickPowerUpgrades.cost) {
      setCoins(coins - clickPowerUpgrades.cost);
      setCoinsPerClick((prev) => prev + 1);
      setClickPowerUpgrades({
        level: clickPowerUpgrades.level + 1,
        cost: Math.floor(clickPowerUpgrades.cost * 1.5),
      });
    }
  };

  const purchaseUpgrade = (index: number) => {
    const upgrade = upgrades[index];
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
    if (coins >= cost) {
      setCoins(coins - cost);
      const newUpgrades = [...upgrades];
      newUpgrades[index].count++;
      setUpgrades(newUpgrades);
      setCps((prev) => Math.round((prev + upgrade.cps) * 10) / 10);
    }
  };

  const rebirth = (newRebirthCoins: number) => {
    const updatedRebirthCoins = Math.min(rebirthCoins + newRebirthCoins, 5000);
    setRebirthCoins(updatedRebirthCoins);
    setSchoolCoinsMultiplyer(schoolCoinsMultiplyer * 2);
    setCoins(0);
    setCps(0);
    setUpgrades(upgradesRef.current);
    setCoinsPerClick(1);
    setClickPowerUpgrades({ level: 1, cost: 50 });
    update(userRef.current, {
      coins: 1000 * rebirthUpgrades[3].count!,
      cps: 0,
      upgrades: [
        { name: 'Учебник', baseCost: 15, costMultiplier: 1.15, cps: 0.1, count: 0 },
        { name: 'Учитель', baseCost: 100, costMultiplier: 1.15, cps: 1, count: 0 },
        { name: 'Класс', baseCost: 1100, costMultiplier: 1.15, cps: 8, count: 0 },
        { name: 'Студент-ассистент', baseCost: 12000, costMultiplier: 1.15, cps: 47, count: 0 },
        { name: 'Школьный комитет', baseCost: 130000, costMultiplier: 1.15, cps: 260, count: 0 },
        { name: 'Директор школы', baseCost: 1400000, costMultiplier: 1.15, cps: 1400, count: 0 },
        { name: 'Руководитель образования', baseCost: 20000000, costMultiplier: 1.15, cps: 7800, count: 0 },
        { name: 'Министр образования', baseCost: 330000000, costMultiplier: 1.15, cps: 44000, count: 0 },
        { name: 'Образовательная корпорация', baseCost: 5100000000, costMultiplier: 1.15, cps: 240000, count: 0 },
        { name: 'Международная академия', baseCost: 75000000000, costMultiplier: 1.15, cps: 1300000, count: 0 },
        { name: 'Университет будущего', baseCost: 1000000000000, costMultiplier: 1.15, cps: 7200000, count: 0 },
        { name: 'Искусственный интеллект-репетитор', baseCost: 14000000000000, costMultiplier: 1.15, cps: 42000000, count: 0 },
        { name: 'Мировой совет образования', baseCost: 200000000000000, costMultiplier: 1.15, cps: 240000000, count: 0 }
      ],
      coinsPerClick: 1,
      clickPowerUpgrades: {
        cost: 50,
        level: 1
      },
      rebirthCoins: updatedRebirthCoins,
      schoolCoinsMultiplyer: schoolCoinsMultiplyer * 2,
    }
    )
  }

  const purchaseRebirthUpgrade = (index: number) => {
    const rebirthUpgrade = rebirthUpgrades[index];
    const cost = rebirthUpgrade.price;
    if (rebirthCoins >= cost) {
      const now = Date.now();
      const duration = 10 * 60 * 1000;
      const endTime = now + duration;

      setRebirthCoins(rebirthCoins - cost);
      if (index === 0) {
        // Энергетический напиток
        update(userRef.current, {
          energyDrinkEndTime: endTime,
        })
        setEnergyDrinkActive(true);
      } else if (index === 1) {
        // Суперускорение
        update(userRef.current, {
          superBoostEndTime: endTime,
        })
        setSuperBoostActive(true);
      } else if (index === 2) {
        // Машина времени
        console.log(coins)
        console.log(coins + cps * 600)
        setCoins(coins + cps * 600);
        update(userRef.current, {
          coins: coins + cps * 600
        })
      } else {
        const newRebirthUpgrades = [...rebirthUpgrades];
        newRebirthUpgrades[index].count!++;
        setRebirthUpgrades(newRebirthUpgrades);
        update(userRef.current, {
          rebirthUpgrades: newRebirthUpgrades
        })
      }
      update(userRef.current, {
        rebirthCoins: rebirthCoins - cost,
      })
    }
  }

    // Обновление таймеров каждую секунду
    useEffect(() => {
      const interval = setInterval(() => {
        setEnergyDrinkTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0));
        setSuperBoostTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0));
      }, 1000);
  
      return () => clearInterval(interval);
    }, []);
  
    // Форматирование времени (в минутах и секундах)
    const formatTime = (milliseconds: number): string => {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

  return (
    <div className="app">
      {isLoading ? (
        // Пока данные загружаются, отображается индикатор загрузки
        <Loader></Loader>
      ) : (
        // Основной контент отображается после завершения загрузки
        <>
          <Account name={name} />
          <div className="content">
            {currentPage === "clicker" && (
              <Clicker
                coins={coins}
                cps={cps}
                coinsPerClick={coinsPerClick}
                upgrades={upgrades}
                clickPowerUpgrades={clickPowerUpgrades}
                onCoinClick={handleClick}
                onBuyClickPowerUpgrade={buyClickPowerUpgrade}
                onPurchaseUpgrade={purchaseUpgrade}
                energyDrinkTimer={formatTime(energyDrinkTimeLeft)}
                superBoostTimer={formatTime(superBoostTimeLeft)}
                energyDrinkActive={energyDrinkActive}
                superBoostActive={superBoostActive}
              />
            )}
            {currentPage === "move" && (
              <Move
                userSchoolCoins={coins}
                userRebirthCoins={rebirthCoins}
                schoolCoinsMultiplyer={schoolCoinsMultiplyer}
                rebirthUpgrades={rebirthUpgrades}
                isEnergyDrinkActive={energyDrinkActive}
                isSuperBoostActive={superBoostActive}
                onMove={rebirth}
                handleBuyItem={purchaseRebirthUpgrade}
              />
            )}
            {currentPage === "leaderboard" && <Leaderboard userId={userId} />}
            {currentPage === "referral" && <ReferralSystem userId={userId} />}
          </div>
          <NavigationBar currentPage={currentPage} setPage={setCurrentPage} />
        </>
      )}
    </div>
  );
};

export default App;
