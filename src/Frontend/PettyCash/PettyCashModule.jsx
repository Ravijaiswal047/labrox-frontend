import React from 'react';
import { useLocalStorage } from '@app/utils/hooks/useLocalStorage';
import CentreBalance from './components/CentreBalance';
import './PettyCash.css';

const PettyCashModule = () => {
  const theme = useLocalStorage('theme', 'get');
  return (
    <div className={`${theme}`}>
      <CentreBalance />
    </div>
  );
};

export default PettyCashModule;
