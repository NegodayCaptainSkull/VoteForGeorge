import React from 'react';
import '../styles/Clicker.scss';

interface UpgradeInterface {
  name: string;
  baseCost: number;
  costMultiplier: number;
  cps: number;
  count: number;
}

interface ClickUpgrade {
  level: number;
  cost: number;
}

interface UpgradeProps {
  upgrades: UpgradeInterface[];
  coins: number;
  clickPowerUpgrades: ClickUpgrade;
  buyClickPowerUpgrade: () => void;
  purchaseUpgrade: (index: number) => void;
}

const Upgrade: React.FC<UpgradeProps> = ({
  upgrades,
  coins,
  clickPowerUpgrades,
  buyClickPowerUpgrade,
  purchaseUpgrade,
}) => {
  return (
    <div className="upgrades">
      <h2>Апгрейды</h2>
      <div className="click-power">
        <p>Улучшение клика</p>
        <button
          onClick={buyClickPowerUpgrade}
          className="upgrade-button"
          disabled={coins < clickPowerUpgrades.cost}
        >
          Купить улучшение клика (Уровень {clickPowerUpgrades.level}) - Стоимость: {clickPowerUpgrades.cost} монет
        </button>
      </div>
      {upgrades.map((upgrade, index) => {
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
        return (
          <div key={index} className="upgrade-item">
            <h3>{upgrade.name}</h3>
            <p>Стоимость: {cost} монет</p>
            <p>Монет в секунду: {upgrade.cps}</p>
            <p>Количество: {upgrade.count}</p>
            <button
              onClick={() => purchaseUpgrade(index)}
              className="upgrade-button"
              disabled={coins < cost}
            >
              Купить
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Upgrade;
