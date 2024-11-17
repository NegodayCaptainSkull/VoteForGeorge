import React from 'react';

function Account (user: string) {
  return (
    <div className='account'>
      <h2>{user}</h2>
    </div>
  );
};

export default Account;
