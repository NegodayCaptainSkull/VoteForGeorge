import React from 'react';
import '../styles/Account.scss';

interface AccountProps {
  name: string; // Указываем, что name всегда будет строкой
}

const Account: React.FC<AccountProps> = ({ name }) => {
  return (
    <div className='account'>
      <h2 className='account-name'>{name}</h2>
    </div>
  );
};

export default Account;
