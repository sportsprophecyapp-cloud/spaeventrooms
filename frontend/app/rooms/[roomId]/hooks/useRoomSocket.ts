import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useRoomSocket = (roomId: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // In production, this URL should come from env
        // For dev, it's typically localhost:8000
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Connect to the specific namespace
        const socketInstance = io(`${socketUrl}/rooms/${roomId}`, {
            transports: ['websocket'],
            autoConnect: true
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [roomId]);

    return { socket, isConnected };
};
