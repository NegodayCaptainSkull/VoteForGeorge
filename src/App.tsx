import React, { useEffect, useState, useCallback, useRef } from 'react';
import Clicker from './components/Clicker';
import { useSearchParams } from 'react-router-dom';
import Account from './components/Account';
import './styles/App.scss';
import Leaderboard from './components/Leaderbord';
import NavigationBar from './components/NavigationBar';
import Move from './components/Move';
import { onValue, ref, update } from 'firebase/database';
import { db } from './firebase';

const DEFAULT_REBIRTH_UPGRADES = [
  { name: "Энергетический напиток", description: "x2 монет за клик на 10 минут", price: 20, count: 0 },
  { name: "Суперускорение", description: "x2 монет в секунду на 10 минут", price: 20, count: 0 },
  { name: "Машина времени", description: "Симулирует 10 минут игры", price: 100, count: 0 },
  { name: "Быстрый старт", description: "Начинайте с 1000 School Coins после переезда", price: 30, count: 0 },
];

const DEFAULT_UPGRADES = [
  { name: 'Учебник', baseCost: 15, costMultiplier: 1.15, cps: 0.1, count: 0 },
  { name: 'Учитель', baseCost: 100, costMultiplier: 1.15, cps: 1, count: 0 },
  { name: 'Класс', baseCost: 1100, costMultiplier: 1.15, cps: 8, count: 0 },
  { name: 'Студент-ассистент', baseCost: 12000, costMultiplier: 1.15, cps: 47, count: 0 },
  { name: 'Школьный комитет', baseCost: 130000, costMultiplier: 1.15, cps: 260, count: 0 },
  { name: 'Директор школы', baseCost: 1400000, costMultiplier: 1.15, cps: 1400, count: 0 },
  { name: 'Руководитель образования', baseCost: 20000000, costMultiplier: 1.15, cps: 7800, count: 0 },
  { name: 'Министр образования', baseCost: 330000000, costMultiplier: 1.15, cps: 44000, count: 0 },
];

const App: React.FC = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name') || 'Гость';
  const username = searchParams.get('username') || 'Unknown';
  const userId = searchParams.get('id');

  const [currentPage, setCurrentPage] = useState<string>('clicker');

  const [coins, setCoins] = useState(0);
  const [rebirthCoins, setRebirthCoins] = useState(0);
  const [schoolCoinsMultiplyer, setSchoolCoinsMultiplyer] = useState(1);
  const [cps, setCps] = useState(0);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  const [upgrades, setUpgrades] = useState<typeof DEFAULT_UPGRADES>(DEFAULT_UPGRADES);
  const [rebirthUpgrades, setRebirthUpgrades] = useState(DEFAULT_REBIRTH_UPGRADES);
  const [clickPowerUpgrades, setClickPowerUpgrades] = useState({ level: 1, cost: 50 });

  const [energyDrinkActive, setEnergyDrinkActive] = useState(false);
  const [superBoostActive, setSuperBoostActive] = useState(false);

  const [energyDrinkTimeLeft, setEnergyDrinkTimeLeft] = useState<number>(0);
  const [superBoostTimeLeft, setSuperBoostTimeLeft] = useState<number>(0);

  const userRef = useRef(ref(db, `users/${userId}`));

  // Форматирование времени (в минутах и секундах)
  const formatTime = useCallback((milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Функция сохранения прогресса с обработкой ошибок
  const saveProgress = useCallback(async () => {
    if (!userId) return;
    try {
      await update(userRef.current, {
        name,
        username,
        coins,
        rebirthCoins,
        schoolCoinsMultiplyer,
        cps,
        coinsPerClick,
        upgrades,
        rebirthUpgrades,
        clickPowerUpgrades,
        lastLogoutTime: Date.now(),
        energyDrinkEndTime: energyDrinkActive ? Date.now() + energyDrinkTimeLeft : null,
        superBoostEndTime: superBoostActive ? Date.now() + superBoostTimeLeft : null,
      });
    } catch (error) {
      console.error("Ошибка при сохранении данных:", error);
      // Здесь можно добавить уведомление пользователю об ошибке сохранения
    }
  }, [
    userId,
    name,
    username,
    coins,
    rebirthCoins,
    schoolCoinsMultiplyer,
    cps,
    coinsPerClick,
    upgrades,
    rebirthUpgrades,
    clickPowerUpgrades,
    energyDrinkActive,
    energyDrinkTimeLeft,
    superBoostActive,
    superBoostTimeLeft,
  ]);

  // Загрузка данных из Firebase
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onValue(userRef.current, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCoins(data.coins ?? 0);
        setRebirthCoins(data.rebirthCoins ?? 0);
        setSchoolCoinsMultiplyer(data.schoolCoinsMultiplyer ?? 1);
        setCps(data.cps ?? 0);
        setUpgrades(data.upgrades ?? DEFAULT_UPGRADES);
        setCoinsPerClick(data.coinsPerClick ?? 1);
        setClickPowerUpgrades(data.clickPowerUpgrades ?? { level: 1, cost: 50 });
        setRebirthUpgrades(data.rebirthUpgrades ?? DEFAULT_REBIRTH_UPGRADES);

        const now = Date.now();

        if (data.energyDrinkEndTime && now < data.energyDrinkEndTime) {
          const timeLeft = Math.max(data.energyDrinkEndTime - now, 0);
          setEnergyDrinkTimeLeft(timeLeft);
          setEnergyDrinkActive(true);
        }

        if (data.superBoostEndTime && now < data.superBoostEndTime) {
          const timeLeft = Math.max(data.superBoostEndTime - now, 0);
          setSuperBoostTimeLeft(timeLeft);
          setSuperBoostActive(true);
        }

        const lastLogoutTime = data.lastLogoutTime ?? 0;
        if (lastLogoutTime > 0) {
          const offlineTime = Math.min(now - lastLogoutTime, 20 * 60 * 1000); // Максимум 20 минут
          let multiplier = (data.superBoostEndTime && lastLogoutTime < data.superBoostEndTime) ? 2 : 1;
          const offlineCoins = Math.floor((offlineTime / 1000) * (data.cps ?? 0) * (data.schoolCoinsMultiplyer ?? 1) * multiplier);

          if (offlineCoins > 0) {
            setCoins((prev) => prev + offlineCoins);
          }
        }
      }
    }, (error) => {
      console.error("Ошибка при загрузке данных:", error);
      // Здесь можно добавить уведомление пользователю об ошибке загрузки
    });

    console.log("Firebase data listener установлен");
    return () => unsubscribe();
  }, [userId]);

  // Автосохранение с троттлингом (каждые 10 секунд)
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      saveProgress();
    }, 10000);

    return () => clearInterval(interval);
  }, [saveProgress, userId]);

  // Сохранение при закрытии окна или смене видимости
  useEffect(() => {
    const handleSave = () => {
      saveProgress();
    };

    window.addEventListener('beforeunload', handleSave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleSave();
      }
    });

    const { WebApp } = (window as any).Telegram || {};
    if (!WebApp) return;
  
    const handleClose = () => {
      saveProgress(); 
    };
  
    WebApp.onEvent('web_app_close', handleClose);

    return () => {
      WebApp.offEvent('web_app_close', handleClose);
      window.removeEventListener('beforeunload', handleSave);
      document.removeEventListener('visibilitychange', handleSave);
    };
  }, [saveProgress]);

  // Управление таймерами бустов
  useEffect(() => {
    let energyTimer: NodeJS.Timeout;
    if (energyDrinkActive && energyDrinkTimeLeft > 0) {
      energyTimer = setTimeout(() => setEnergyDrinkActive(false), energyDrinkTimeLeft);
    }
    return () => {
      if (energyTimer) clearTimeout(energyTimer);
    };
  }, [energyDrinkActive, energyDrinkTimeLeft]);

  useEffect(() => {
    let superBoostTimer: NodeJS.Timeout;
    if (superBoostActive && superBoostTimeLeft > 0) {
      superBoostTimer = setTimeout(() => setSuperBoostActive(false), superBoostTimeLeft);
    }
    return () => {
      if (superBoostTimer) clearTimeout(superBoostTimer);
    };
  }, [superBoostActive, superBoostTimeLeft]);

  // Увеличение монет от CPS каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      const multiplier = superBoostActive ? 2 : 1;
      setCoins((prevCoins) => Math.round((prevCoins + cps * schoolCoinsMultiplyer * multiplier) * 10) / 10);
    }, 1000);

    return () => clearInterval(interval);
  }, [cps, schoolCoinsMultiplyer, superBoostActive]);

  // Обновление таймеров бустов каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      if (energyDrinkTimeLeft > 0) {
        setEnergyDrinkTimeLeft((prev) => Math.max(prev - 1000, 0));
      }
      if (superBoostTimeLeft > 0) {
        setSuperBoostTimeLeft((prev) => Math.max(prev - 1000, 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [energyDrinkTimeLeft, superBoostTimeLeft]);

  // Обработчики событий
  const handleClick = useCallback(() => {
    const multiplier = energyDrinkActive ? 2 : 1;
    setCoins((prev) => prev + coinsPerClick * schoolCoinsMultiplyer * multiplier);
  }, [coinsPerClick, schoolCoinsMultiplyer, energyDrinkActive]);

  const buyClickPowerUpgrade = useCallback(() => {
    if (coins >= clickPowerUpgrades.cost) {
      setCoins((prev) => prev - clickPowerUpgrades.cost);
      setCoinsPerClick((prev) => prev + 1);
      setClickPowerUpgrades({
        level: clickPowerUpgrades.level + 1,
        cost: Math.floor(clickPowerUpgrades.cost * 1.5),
      });
    }
  }, [coins, clickPowerUpgrades]);

  const purchaseUpgrade = useCallback((index: number) => {
    const upgrade = upgrades[index];
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
    if (coins >= cost) {
      setCoins((prev) => prev - cost);
      setUpgrades((prevUpgrades) => {
        const newUpgrades = [...prevUpgrades];
        newUpgrades[index] = { ...newUpgrades[index], count: newUpgrades[index].count + 1 };
        return newUpgrades;
      });
      setCps((prev) => Math.round((prev + upgrade.cps) * 10) / 10);
    }
  }, [upgrades, coins]);

  const rebirth = useCallback(async (newRebirthCoins: number) => {
    const updatedRebirthCoins = Math.min(rebirthCoins + newRebirthCoins, 5000);
    setRebirthCoins(updatedRebirthCoins);
    setSchoolCoinsMultiplyer((prev) => prev * 2);
    setCoins(0);
    setCps(0);
    setUpgrades(DEFAULT_UPGRADES);
    setCoinsPerClick(1);
    setClickPowerUpgrades({ level: 1, cost: 50 });
    setRebirthUpgrades(DEFAULT_REBIRTH_UPGRADES);
    setEnergyDrinkActive(false);
    setSuperBoostActive(false);
    setEnergyDrinkTimeLeft(0);
    setSuperBoostTimeLeft(0);

    try {
      await update(userRef.current, {
        coins: 1000 * (rebirthUpgrades.find(u => u.name === "Быстрый старт")?.count ?? 0),
        cps: 0,
        upgrades: DEFAULT_UPGRADES,
        coinsPerClick: 1,
        clickPowerUpgrades: { level: 1, cost: 50 },
        rebirthCoins: updatedRebirthCoins,
        schoolCoinsMultiplyer: schoolCoinsMultiplyer * 2,
      });
    } catch (error) {
      console.error("Ошибка при сбросе (rebirth):", error);
      // Здесь можно добавить уведомление пользователю об ошибке сброса
    }
  }, [rebirthCoins, schoolCoinsMultiplyer, rebirthUpgrades]);

  const purchaseRebirthUpgrade = useCallback(async (index: number) => {
    const rebirthUpgrade = rebirthUpgrades[index];
    const cost = rebirthUpgrade.price;
    if (rebirthCoins >= cost) {
      const now = Date.now();
      const duration = 10 * 60 * 1000;
      const endTime = now + duration;

      try {
        if (index === 0) {
          // Энергетический напиток
          await update(userRef.current, {
            energyDrinkEndTime: endTime,
          });
          setEnergyDrinkActive(true);
          setEnergyDrinkTimeLeft(duration);
        } else if (index === 1) {
          // Суперускорение
          await update(userRef.current, {
            superBoostEndTime: endTime,
          });
          setSuperBoostActive(true);
          setSuperBoostTimeLeft(duration);
        } else if (index === 2) {
          // Машина времени
          const addedCoins = cps * 600;
          setCoins((prev) => prev + addedCoins);
          await update(userRef.current, {
            coins: coins + addedCoins,
          });
        } else {
          // Быстрый старт или другие будущие апгрейды
          setRebirthUpgrades((prevUpgrades) => {
            const newUpgrades = [...prevUpgrades];
            newUpgrades[index].count += 1;
            return newUpgrades;
          });
          await update(userRef.current, {
            rebirthUpgrades: rebirthUpgrades.map((u, i) => (i === index ? { ...u, count: u.count + 1 } : u)),
          });
        }

        // Обновление rebirthCoins
        setRebirthCoins((prev) => prev - cost);
        await update(userRef.current, {
          rebirthCoins: rebirthCoins - cost,
        });
      } catch (error) {
        console.error("Ошибка при покупке rebirth апгрейда:", error);
        // Здесь можно добавить уведомление пользователю об ошибке покупки
      }
    }
  }, [rebirthUpgrades, rebirthCoins, cps, coins]);

  return (
    <div className='app'>
      <Account name={name} />
      <div className='content'>
        {currentPage === 'clicker' && (
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
        {currentPage === 'move' && (
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
        {currentPage === 'leaderboard' && <Leaderboard userId={userId} />}
      </div>
      <NavigationBar currentPage={currentPage} setPage={setCurrentPage} />
    </div>
  );
};

export default App;