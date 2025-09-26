import { useContext } from 'react';
import { ActivityLogContext } from '../contexts/ActivityLogContext';

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (context === undefined) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
};