import React from 'react';
import Clicker from './components/Clicker';
import { useSearchParams } from 'react-router-dom';

const App: React.FC = () => {
  const [searchParams] = useSearchParams()

  const name = searchParams.get('name');
  const username = searchParams.get('username');
  const id = searchParams.get('id');
  return (
    <div>
      <Clicker />
    </div>
  );
};

export default App;
