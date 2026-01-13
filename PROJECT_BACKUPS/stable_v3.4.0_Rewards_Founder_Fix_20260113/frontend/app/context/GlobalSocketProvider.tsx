'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface GlobalSocketContextType {
    socket: Socket | null;
}

const GlobalSocketContext = createContext<GlobalSocketContextType>({ socket: null });

export const useGlobalSocket = () => useContext(GlobalSocketContext);

export const GlobalSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const socketInstance = io(apiUrl, {
            query: { userId: user.id },
            transports: ['websocket']
        });

        socketInstance.on('connect', () => {
            console.log('Global socket connected.');
        });

        // Listen for private messages
        socketInstance.on('private_message', (data: { from: string, message: string }) => {
            alert(`Message from ${data.from}:\n${data.message}`);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.off('private_message');
            socketInstance.disconnect();
        };
    }, [user]);

    return (
        <GlobalSocketContext.Provider value={{ socket }}>
            {children}
        </GlobalSocketContext.Provider>
    );
};
