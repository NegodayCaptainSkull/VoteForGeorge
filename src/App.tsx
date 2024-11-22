import React, { useEffect, useRef, useState } from 'react';
import Clicker from './components/Clicker';
import { useSearchParams } from 'react-router-dom';
import Account from './components/Account';
import './styles/App.scss';
import Leaderboard from './components/Leaderbord';
import NavigationBar from './components/NavigationBar';
import Move from './components/Move';
import { onValue, ref, update } from 'firebase/database';
import { db } from './firebase';

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
      const unsubscribe = onValue(userRef.current, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCoins(data.coins || 0);
          setRebirthCoins(data.rebirthCoins || 0);
          setSchoolCoinsMultiplyer(data.schoolCoinsMultiplyer || 1);
          setCps(data.cps || 0);
          setUpgrades(data.upgrades || upgradesRef.current);
          setCoinsPerClick(data.coinsPerClick || 1);
          setClickPowerUpgrades(data.clickPowerUpgrades || { level: 1, cost: 50 });
          setRebirthUpgrades(data.rebirthUpgrades || 
            [
              {name: "Энергетический напиток", description: "x2 монет за клик на 10 минут", price: 20},
              {name: "Суперускорение", description: "x2 монет в секунду на 10 минут", price: 20},
              {name: "Машина времени", description: "Симулирует 10 минут игры", price: 100},
              {name: "Быстрый старт", description: "Начинайте с 1000 School Coins после переезда", price: 30, count: 0 },
            ]
          )
  
          // Расчёт оффлайн-фарма
          const now = Date.now();
          if (data.energyDrinkEndTime && now < data.energyDrinkEndTime) {
            const timeLeft = Math.max(data.energyDrinkEndTime - now, 0);
            setEnergyDrinkTimeLeft(timeLeft);
            setEnergyDrinkActive(true);
            setTimeout(() => setEnergyDrinkActive(false), data.energyDrinkEndTime - now);
          }
          if (data.superBoostEndTime && now < data.superBoostEndTime) {
            const timeLeft = Math.max(data.superBoostEndTime - now, 0);
            setSuperBoostTimeLeft(timeLeft);
            setSuperBoostActive(true);
            setTimeout(() => setSuperBoostActive(false), data.superBoostEndTime - now);
          }

          const lastLogoutTime = data.lastLogoutTime || 0;
  
          if (lastLogoutTime > 0) {
            const offlineTime = Math.min(now - lastLogoutTime, 60 * 20 * 1000); // Максимум 20 минут
            let multiplier = data.superBoostEndTime && lastLogoutTime < data.superBoostEndTime ? 2 : 1;
            const offlineCoins = Math.floor((offlineTime / 1000) * (data.cps || 0) * (data.schoolCoinsMultiplyer || 1) * multiplier);

            if (offlineCoins > 0) {
              const newCoins = (data.coins || 0) + offlineCoins;
              if (newCoins !== data.coins) {
                setCoins(newCoins);
              }
            }
          }
        }
      });
  
      console.log("rendered");
      return () => unsubscribe();
    }
  }, [userId]);
  

  // Сохранение данных в Firebase каждые 10 секунд
  useEffect(() => {
    const saveData = setInterval(() => {
      update(userRef.current, {
        name: nameRef.current,
        username: userNameRef.current,
        coins: coinsRef.current,
        cps: cpsRef.current,
        upgrades: upgradesRef.current,
        coinsPerClick: coinsPerClickRef.current,
        clickPowerUpgrades: clickPowerUpgradesRef.current,
        lastLogoutTime: Date.now(),
      });
    }, 10000);

    return () => clearInterval(saveData);
  }, []);

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
  const handleClick = () => {
    const multiplier = energyDrinkActive ? 2 : 1; // Если активен энергетик, умножаем на 2
    setCoins(coins + coinsPerClick * schoolCoinsMultiplyer * multiplier);
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
    setRebirthCoins(rebirthCoins + newRebirthCoins);
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
      ],
      coinsPerClick: 1,
      clickPowerUpgrades: {
        cost: 50,
        level: 1
      },
      rebirthCoins: rebirthCoins + newRebirthCoins,
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
    <div className='app'>
        <Account name={name}/>
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
          {currentPage === 'move' && <Move userSchoolCoins={coins} userRebirthCoins={rebirthCoins} schoolCoinsMultiplyer={schoolCoinsMultiplyer} rebirthUpgrades={rebirthUpgrades} isEnergyDrinkActive={energyDrinkActive} isSuperBoostActive={superBoostActive} onMove={rebirth} handleBuyItem={purchaseRebirthUpgrade} />}
          {currentPage === 'leaderboard' && <Leaderboard userId={userId} />}
        </div>
      {/* Здесь добавьте другие страницы */}
      <NavigationBar currentPage={currentPage} setPage={setCurrentPage} />
    </div>
  );
};

export default App;
