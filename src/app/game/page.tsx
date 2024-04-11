'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from '@/app/ui/header';
import DrawingCanvas, { Point } from '@/app/ui/canvas';
import ChatWindow from '@/app/ui/chat';
import { useUserContext } from "@/app/lib/context/UserContext";
import { StartForm } from '@/app/ui/startForm';
import { gameApi } from "@/config/axios.config";

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
    const userContext = useUserContext();
    const username = userContext?.user?.username
    const searchParams = useSearchParams();
    const roomId = searchParams.get('roomId');
    const role = searchParams.get('role');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [action, setAction] = useState<ActionState[]>([]);
    const webSocketRef = useRef<WebSocket | null>(null);
    const [isWebSocketConnected, setIsWebSocketConnected] = useState<number>(0);
    const [isFormOpen, setIsFormOpen] = useState(false);


    const handleOpenForm = () => setIsFormOpen(true);
    const handleCloseForm = () => setIsFormOpen(false);
    const handleSubmitForm = (answer: string, delay: number) => {
        console.log("Answer Submitted: ", answer, "Delay: ", delay);
        const delayUntilFinish = delay * 1000;
        gameApi.post('/start/' + roomId, { answer, delayUntilFinish }).then(res => { console.log(res.data) });
        setIsFormOpen(false); // Close the form upon submission
    };

    // Initialize WebSocket connection once roomId is available
    useEffect(() => {
        if (!roomId) return;

        webSocketRef.current = new WebSocket(`ws://localhost:8000/game/?role=${role}&roomId=${roomId}`);

        webSocketRef.current.onopen = () => {
            console.log('WebSocket connection established');
            setIsWebSocketConnected(1);
        };

        webSocketRef.current.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
                setMessages(prevMessages => [...prevMessages, data]);
            } else if (data.type.startsWith('draw')) {
                setAction(prevPath => [...prevPath, data]);
            }
            else if (data.type === 'ping') {
                webSocketRef.current?.send(JSON.stringify({ type: 'pong' }));
            }
            else if (data.type === 'round-start') {
                setAction(prevPath => [...prevPath, { type: data.type }]);
                alert('Round started!');
            }
            else if (data.type === 'round-finish') {
                alert('Round finished!, correct answer was: ' + data.correctAnswer);
            }
            else if (data.type === 'correct') {
                alert('Correct answer by: ' + data.winner + '!\n' + "it was: " + data.correctAnswers);
            }
        };

        webSocketRef.current.onclose = (event) => {
            console.log('WebSocket connection closed', event.code);
            if (event.code === 4002) {
                setIsWebSocketConnected(2);
            }
            else {
                setIsWebSocketConnected(0);
            }
        };

        webSocketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsWebSocketConnected(1);
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
            sender: username!,
        };
        webSocketRef.current?.send(JSON.stringify(message));
        console.log('messages', message);
        setMessages(prevMessages => [...prevMessages, message]);
    }, []);

    // Callback for sending draw actions
    const sendDrawAction = useCallback((type: string, point?: Point) => {
        if (type === 'draw' || type === 'draw-start') {
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
            <Header onOpenForm={handleOpenForm} />
            {isWebSocketConnected == 1 ? (
                <main className="flex flex-1">
                    <StartForm isOpen={isFormOpen} onClose={handleCloseForm} onSubmit={handleSubmitForm} />
                    <DrawingCanvas actions={action} setActions={setAction} sendDrawAction={sendDrawAction} />
                    <ChatWindow messages={messages} sendChatMessage={sendChatMessage} />
                </main>
            ) : (
                isWebSocketConnected == 2 ? <div>Too much admins</div> : <div>Loading...</div>
            )}
        </div>
    );
};

export default RoomPage;