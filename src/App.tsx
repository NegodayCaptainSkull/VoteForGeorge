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
  const [clickPowerUpgrades, setClickPowerUpgrades] = useState({ level: 1, cost: 50 });

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
          setSchoolCoinsMultiplyer(data.schoolCoinsMultiplyer || 1)
          setCps(data.cps || 0);
          setUpgrades(data.upgrades || upgradesRef.current);
          setCoinsPerClick(data.coinsPerClick || 1);
          setClickPowerUpgrades(data.clickPowerUpgrades || { level: 1, cost: 50 });
        }
      });

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
      });
    }, 10000);

    return () => clearInterval(saveData);
  }, []);

  // Увеличение монет от CPS каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prevCoins) => Math.round((prevCoins + cps * schoolCoinsMultiplyer) * 10) / 10);
    }, 1000);

    return () => clearInterval(interval);
  }, [cps, schoolCoinsMultiplyer]);

  // Обработчики
  const handleClick = () => setCoins(coins + coinsPerClick * schoolCoinsMultiplyer);

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
      setCps((prev) => prev + upgrade.cps);
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
      coins: 0,
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
              />
            )}
          {currentPage === 'move' && <Move userSchoolCoins={coins} userRebirthCoins={rebirthCoins} onMove={rebirth} />}
          {currentPage === 'leaderboard' && <Leaderboard userId={userId} />}
        </div>
      {/* Здесь добавьте другие страницы */}
      <NavigationBar currentPage={currentPage} setPage={setCurrentPage} />
    </div>
  );
};

export default App;
