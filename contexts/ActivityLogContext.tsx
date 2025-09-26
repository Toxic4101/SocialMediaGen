import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { LogEntry, LogType } from '../types';

interface ActivityLogContextType {
  logs: LogEntry[];
  addLog: (message: string, type?: LogType) => void;
}

export const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);

  const addLog = useCallback((message: string, type: LogType = 'INFO') => {
    const newLog: LogEntry = {
      id: logCounter,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogCounter(prev => prev + 1);
    setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100));
  }, [logCounter]);

  return (
    <ActivityLogContext.Provider value={{ logs, addLog }}>
      {children}
    </ActivityLogContext.Provider>
  );
};