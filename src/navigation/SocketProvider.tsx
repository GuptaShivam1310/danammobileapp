import React, { createContext, useContext, useEffect } from 'react';
import { useAppSelector } from '../store';
import { useChatSocket } from '../hooks/useChatSocket';

const SocketContext = createContext<any>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAppSelector(state => state.auth);
    const userId = String(user?.id || '');

    const socket = useChatSocket(isAuthenticated ? userId : '');

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
