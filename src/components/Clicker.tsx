import React from 'react';
import Coin from './Coin';
import Upgrade from './Upgrade';
import '../styles/Clicker.scss';

interface ClickerProps {
  coins: number;
  cps: number;
  coinsPerClick: number;
  upgrades: any[];
  clickPowerUpgrades: { level: number; cost: number };
  onCoinClick: () => void;
  onBuyClickPowerUpgrade: () => void;
  onPurchaseUpgrade: (index: number) => void;
}

const Clicker: React.FC<ClickerProps> = ({
  coins,
  cps,
  coinsPerClick,
  upgrades,
  clickPowerUpgrades,
  onCoinClick,
  onBuyClickPowerUpgrade,
  onPurchaseUpgrade,
}) => {
  return (
    <div className="clicker-container">
      <Coin coins={coins} cps={cps} onClick={onCoinClick} />
      <Upgrade
        upgrades={upgrades}
        coins={coins}
        clickPowerUpgrades={clickPowerUpgrades}
        buyClickPowerUpgrade={onBuyClickPowerUpgrade}
        purchaseUpgrade={onPurchaseUpgrade}
      />
    </div>
  );
};

export default Clicker;
