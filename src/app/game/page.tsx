'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from '@/app/ui/header';
import DrawingCanvas, { Point } from '@/app/ui/canvas';
import ChatWindow from '@/app/ui/chat';
import { useUserContext } from "@/app/lib/context/UserContext";


type ChatMessage = {
    sender: string;
    text: string;
    date?: string;
};

type ActionState = {
    type: string;
    point?: Point;
  };

const RoomPage: React.FC = () => {
    const router = useRouter();
    const userContext = useUserContext();
    const searchParams = useSearchParams();
    const roomId = searchParams.get('roomId');
    const role = searchParams.get('role');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [action, setAction] = useState<ActionState[]>([]);
    const webSocketRef = useRef<WebSocket | null>(null);

    // Initialize WebSocket connection once roomId is available
    useEffect(() => {
        if (!roomId) return;

        webSocketRef.current = new WebSocket(`ws://localhost:8000/game/?role=${role}&roomId=${roomId}`);

        webSocketRef.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        webSocketRef.current.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
                setMessages(prevMessages => [...prevMessages, data.message]);
            } else if (data.type.startsWith('draw')) {
                setAction(prevPath => [...prevPath, data]);
            }
            else if (data.type === 'ping') {
                webSocketRef.current?.send(JSON.stringify({ type: 'pong' }));
            }
        };

        webSocketRef.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        webSocketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Clean up the WebSocket connection when the component unmounts
        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, [roomId]);

    const sendChatMessage = useCallback((messageContent: string) => {
        const message = {
            type: 'chat',
            text: messageContent,
            sender: userContext?.user?.username,
        };
        webSocketRef.current?.send(JSON.stringify(message));
    }, []);

    // Callback for sending draw actions
    const sendDrawAction = useCallback((type: string, point?: Point) => {
        if (type === 'draw'  || type === 'draw-start') {
            const drawAction = {
                type: type,
                point: point,
            };
            webSocketRef.current?.send(JSON.stringify(drawAction));
        }
        else if (type === 'draw-stop') {
            const drawAction = { type: type, };
            webSocketRef.current?.send(JSON.stringify(drawAction));
        }
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <main className="flex flex-1">
                <DrawingCanvas actions={action} setActions={setAction} sendDrawAction={sendDrawAction} />
                <ChatWindow messages={messages} sendChatMessage={sendChatMessage} />
            </main>
        </div>
    );
};

export default RoomPage;