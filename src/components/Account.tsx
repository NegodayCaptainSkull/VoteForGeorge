import React from 'react';

interface AccountProps {
  name: string; // Указываем, что name всегда будет строкой
}

const Account: React.FC<AccountProps> = ({ name }) => {
  return (
    <div className='account'>
      <h2>{name}</h2>
    </div>
  );
};

export default Account;
