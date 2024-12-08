import React, { useEffect, useState, useCallback } from 'react';
import Clicker from './components/Clicker';
import { useSearchParams } from 'react-router-dom';
import Account from './components/Account';
import './styles/App.scss';
import Leaderboard from './components/Leaderbord';
import NavigationBar from './components/NavigationBar';
import Move from './components/Move';
import { onValue, ref, update, set, runTransaction } from 'firebase/database';
import { db } from './firebase';

// Константы по умолчанию
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

const DEFAULT_REBIRTH_UPGRADES = [
  { name: "Энергетический напиток", description: "x2 монет за клик на 10 минут", price: 20, count: 0 },
  { name: "Суперускорение", description: "x2 монет в секунду на 10 минут", price: 20, count: 0 },
  { name: "Машина времени", description: "Симулирует 10 минут игры", price: 100, count: 0 },
  { name: "Быстрый старт", description: "Начинайте с 1000 School Coins после переезда", price: 30, count: 0 },
];

const App: React.FC = () => {
  const [searchParams] = useSearchParams();

  const name = searchParams.get('name') || 'Гость';
  const username = searchParams.get('username') || 'Unknown';
  const userId = searchParams.get('id');

  const [currentPage, setCurrentPage] = useState<string>('clicker');

  // Состояния игры
  const [coins, setCoins] = useState(0);
  const [rebirthCoins, setRebirthCoins] = useState(0);
  const [schoolCoinsMultiplyer, setSchoolCoinsMultiplyer] = useState(1);
  const [cps, setCps] = useState(0);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  const [upgrades, setUpgrades] = useState<typeof DEFAULT_UPGRADES>(DEFAULT_UPGRADES);
  const [rebirthUpgrades, setRebirthUpgrades] = useState<typeof DEFAULT_REBIRTH_UPGRADES>(DEFAULT_REBIRTH_UPGRADES);
  const [clickPowerUpgrades, setClickPowerUpgrades] = useState({ level: 1, cost: 50 });

  const [energyDrinkActive, setEnergyDrinkActive] = useState(false);
  const [superBoostActive, setSuperBoostActive] = useState(false);

  const [energyDrinkTimeLeft, setEnergyDrinkTimeLeft] = useState<number>(0);
  const [superBoostTimeLeft, setSuperBoostTimeLeft] = useState<number>(0);

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
      await update(ref(db, `users/${userId}`), {
        name,
        username,
        lastLogoutTime: Date.now(),
      });
      console.log("Данные успешно сохранены в Firebase.");
    } catch (error) {
      console.error("Ошибка при сохранении данных в Firebase:", error);
      // Здесь можно добавить уведомление пользователю об ошибке сохранения
    }
  }, [
    userId,
    name,
    username,
  ]);

  // Загрузка данных из Firebase с использованием слушателя
  useEffect(() => {
    if (!userId) return;

    const userRefFirebase = ref(db, `users/${userId}`);

    const unsubscribe = onValue(userRefFirebase, (snapshot) => {
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
          const multiplier = (data.superBoostEndTime && lastLogoutTime < data.superBoostEndTime) ? 2 : 1;
          const offlineCoins = Math.floor((offlineTime / 1000) * (data.cps ?? 0) * (data.schoolCoinsMultiplyer ?? 1) * multiplier);

          if (offlineCoins > 0) {
            setCoins((prev) => prev + offlineCoins);
          }
        }
      } else {
        // Инициализация данных, если они отсутствуют
        set(ref(db, `users/${userId}`), {
          name,
          username,
          coins: 0,
          rebirthCoins: 0,
          schoolCoinsMultiplyer: 1,
          cps: 0,
          coinsPerClick: 1,
          upgrades: DEFAULT_UPGRADES,
          rebirthUpgrades: DEFAULT_REBIRTH_UPGRADES,
          clickPowerUpgrades: { level: 1, cost: 50 },
          lastLogoutTime: Date.now(),
          energyDrinkEndTime: null,
          superBoostEndTime: null,
        }).catch((error) => {
          console.error("Ошибка при инициализации данных пользователя:", error);
          // Добавьте уведомление пользователю об ошибке инициализации
        });
      }
    }, (error) => {
      console.error("Ошибка при загрузке данных из Firebase:", error);
      // Добавьте уведомление пользователю об ошибке загрузки
    });

    console.log("Firebase data listener установлен");
    return () => unsubscribe();
  }, [userId, name, username]);

  // Сохранение данных в Firebase каждые 10 секунд
  useEffect(() => {
    if (!userId) return;

    const saveDataInterval = setInterval(() => {
      saveProgress();
    }, 10000); // Каждые 10 секунд

    return () => clearInterval(saveDataInterval);
  }, [saveProgress, userId]);

  // Сохранение данных при закрытии окна или смене видимости
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

    return () => {
      window.removeEventListener('beforeunload', handleSave);
      document.removeEventListener('visibilitychange', handleSave);
    };
  }, [saveProgress]);

  // Управление таймерами для бустов
  useEffect(() => {
    let energyTimer: NodeJS.Timeout;
    if (energyDrinkActive && energyDrinkTimeLeft > 0) {
      energyTimer = setTimeout(() => {
        setEnergyDrinkActive(false);
        setEnergyDrinkTimeLeft(0);
        saveProgress(); // Сохранить состояние после завершения буста
      }, energyDrinkTimeLeft);
    }
    return () => {
      if (energyTimer) clearTimeout(energyTimer);
    };
  }, [energyDrinkActive, energyDrinkTimeLeft, saveProgress]);

  useEffect(() => {
    let superBoostTimer: NodeJS.Timeout;
    if (superBoostActive && superBoostTimeLeft > 0) {
      superBoostTimer = setTimeout(() => {
        setSuperBoostActive(false);
        setSuperBoostTimeLeft(0);
        saveProgress(); // Сохранить состояние после завершения буста
      }, superBoostTimeLeft);
    }
    return () => {
      if (superBoostTimer) clearTimeout(superBoostTimer);
    };
  }, [superBoostActive, superBoostTimeLeft, saveProgress]);

  // Увеличение монет от CPS каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      const multiplier = superBoostActive ? 2 : 1; // Если активен суперускоритель, умножаем на 2
      setCoins((prevCoins) => Math.round((prevCoins + cps * schoolCoinsMultiplyer * multiplier) * 10) / 10);
    }, 1000);

    return () => clearInterval(interval);
  }, [cps, schoolCoinsMultiplyer, superBoostActive]);

  // Обновление таймеров оставшегося времени каждые секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyDrinkTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0));
      setSuperBoostTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Обработчики событий
  const handleClick = useCallback(async () => {
    if (!userId) return;
    const multiplier = energyDrinkActive ? 2 : 1;

    try {
      await runTransaction(ref(db, `users/${userId}/coins`), (currentCoins) => {
        if (currentCoins === null) return 0;
        return currentCoins + coinsPerClick * schoolCoinsMultiplyer * multiplier;
      });
      console.log("Монеты успешно увеличены");
    } catch (error) {
      console.error("Ошибка при увеличении монет:", error);
      // Добавьте уведомление пользователю об ошибке
    }
  }, [userId, energyDrinkActive, coinsPerClick, schoolCoinsMultiplyer]);

  const buyClickPowerUpgrade = useCallback(async () => {
    if (!userId) return;
    if (coins < clickPowerUpgrades.cost) return;

    try {
      await runTransaction(ref(db, `users/${userId}`), (currentData) => {
        if (currentData === null) return;

        if (currentData.coins === undefined || currentData.clickPowerUpgrades === undefined) return currentData;

        if (currentData.coins >= clickPowerUpgrades.cost) {
          currentData.coins -= clickPowerUpgrades.cost;
          currentData.coinsPerClick += 1;
          currentData.clickPowerUpgrades.level += 1;
          currentData.clickPowerUpgrades.cost = Math.floor(currentData.clickPowerUpgrades.cost * 1.5);
        }
        return currentData;
      });
      console.log("Улучшение клика куплено");
    } catch (error) {
      console.error("Ошибка при покупке улучшения клика:", error);
      // Добавьте уведомление пользователю об ошибке
    }
  }, [userId, coins, clickPowerUpgrades]);

  const purchaseUpgrade = useCallback(async (index: number) => {
    if (!userId) return;
    const upgrade = upgrades[index];
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
    if (coins < cost) return;

    try {
      await runTransaction(ref(db, `users/${userId}`), (currentData) => {
        if (currentData === null) return;
        if (currentData.coins === undefined || currentData.upgrades === undefined || !currentData.upgrades[index]) return currentData;

        if (currentData.coins >= cost) {
          currentData.coins -= cost;
          currentData.upgrades[index].count += 1;
          currentData.cps = Math.round((currentData.cps + upgrade.cps) * 10) / 10;
        }
        return currentData;
      });
      console.log(`Улучшение ${upgrade.name} куплено`);
    } catch (error) {
      console.error(`Ошибка при покупке улучшения ${upgrade.name}:`, error);
      // Добавьте уведомление пользователю об ошибке
    }
  }, [userId, coins, upgrades]);

  const rebirth = useCallback(async (newRebirthCoins: number) => {
    if (!userId) return;
    const updatedRebirthCoins = Math.min(rebirthCoins + newRebirthCoins, 5000);

    try {
      await runTransaction(ref(db, `users/${userId}`), (currentData) => {
        if (currentData === null) return;

        currentData.rebirthCoins = updatedRebirthCoins;
        currentData.schoolCoinsMultiplyer *= 2;
        currentData.coins = 0;
        currentData.cps = 0;
        currentData.upgrades = DEFAULT_UPGRADES;
        currentData.coinsPerClick = 1;
        currentData.clickPowerUpgrades = { level: 1, cost: 50 };
        currentData.rebirthUpgrades = DEFAULT_REBIRTH_UPGRADES;
        currentData.energyDrinkEndTime = null;
        currentData.superBoostEndTime = null;
        currentData.lastLogoutTime = Date.now();
        return currentData;
      });
      console.log("Rebirth выполнен и данные сохранены.");
    } catch (error) {
      console.error("Ошибка при выполнении rebirth:", error);
      // Добавьте уведомление пользователю об ошибке rebirth
    }
  }, [userId, rebirthCoins]);

  const purchaseRebirthUpgrade = useCallback(async (index: number) => {
    if (!userId) return;
    const rebirthUpgrade = rebirthUpgrades[index];
    const cost = rebirthUpgrade.price;
    if (rebirthCoins < cost) return;

    try {
      await runTransaction(ref(db, `users/${userId}`), (currentData) => {
        if (currentData === null) return;

        if (currentData.rebirthCoins === undefined || currentData.rebirthUpgrades === undefined) return currentData;

        if (currentData.rebirthCoins < cost) return; // Не хватает монет

        currentData.rebirthCoins -= cost;

        if (index === 0) {
          // Энергетический напиток
          const duration = 10 * 60 * 1000; // 10 минут
          currentData.energyDrinkEndTime = Date.now() + duration;
        } else if (index === 1) {
          // Суперускорение
          const duration = 10 * 60 * 1000; // 10 минут
          currentData.superBoostEndTime = Date.now() + duration;
        } else if (index === 2) {
          // Машина времени
          const addedCoins = currentData.cps * 600;
          currentData.coins += addedCoins;
        } else if (index === 3) {
          // Быстрый старт или другие будущие апгрейды
          currentData.rebirthUpgrades[index].count = (currentData.rebirthUpgrades[index].count || 0) + 1;
          currentData.coins += 1000 * currentData.rebirthUpgrades[index].count;
        }

        return currentData;
      });
      console.log(`Rebirth Upgrade ${rebirthUpgrade.name} куплен.`);
    } catch (error) {
      console.error("Ошибка при покупке rebirth апгрейда:", error);
      // Добавьте уведомление пользователю об ошибке покупки
    }
  }, [userId, rebirthUpgrades, rebirthCoins]);

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
      {/* Здесь добавьте другие страницы */}
      <NavigationBar currentPage={currentPage} setPage={setCurrentPage} />
    </div>
  );
};

export default App;