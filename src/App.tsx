import React from 'react';
import Clicker from './components/Clicker';
import { useSearchParams } from 'react-router-dom';
import Account from './components/Account';

const App: React.FC = () => {
  const [searchParams] = useSearchParams()

  const name = searchParams.get('name') || 'Гость';
  // const username = searchParams.get('username');
  // const id = searchParams.get('id');
  return (
    <div>
      <Account name={name}/>
      <Clicker />
    </div>
  );
};

export default App;
