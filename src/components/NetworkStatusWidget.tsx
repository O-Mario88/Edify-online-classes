import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudCog } from 'lucide-react';
import { Badge } from './ui/badge';
import { OfflineSyncEngine } from '../lib/offlineSync';

export const NetworkStatusWidget: React.FC = () => {
  const [isOnline, setIsOnline] = useState(OfflineSyncEngine.isOnline());
  const [showSyncing, setShowSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncing(true);
      
      // Simulate sync finish UX
      setTimeout(() => setShowSyncing(false), 3000);
      OfflineSyncEngine.processQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showSyncing) return null; // Hide if perfectly fine

  return (
    <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4">
      <Badge 
        className={`px-3 py-1.5 shadow-lg flex items-center gap-2 ${
          !isOnline ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff size={14} className="animate-pulse" />
            <span>Offline Mode</span>
          </>
        ) : (
          <>
             <CloudCog size={14} className="animate-spin" />
             <span>Syncing Progress...</span>
          </>
        )}
      </Badge>
    </div>
  );
};
