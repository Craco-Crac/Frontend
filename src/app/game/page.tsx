'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from '@/app/ui/header';
import DrawingCanvas, { Point } from '@/app/ui/canvas';
import ChatWindow from '@/app/ui/chat';
import { useUserContext } from "@/app/lib/context/UserContext";
import { StartForm } from '@/app/ui/startForm';
import { gameApi } from "@/config/axios.config";

interface ChatMessage {
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
    const searchParams = useSearchParams();
    const roomId = searchParams.get('roomId');
    const role = searchParams.get('role');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [action, setAction] = useState<ActionState[]>([]);
    const webSocketRef = useRef<WebSocket | null>(null);
    const [isWebSocketConnected, setIsWebSocketConnected] =
        useState<{ connected: boolean, errMessage?: string }>({ connected: false });
    const [isFormOpen, setIsFormOpen] = useState(false);


    const handleOpenForm = () => setIsFormOpen(true);
    const handleCloseForm = () => setIsFormOpen(false);
    const handleSubmitForm = (answer: string, delay: number) => {
        console.log("Gamge starts, answer: ", answer, "Delay: ", delay);
        const delayUntilFinish = delay * 1000;
        gameApi.post('/start/' + roomId, { answer, delayUntilFinish }).then(res => { console.log(res.data) });
        setIsFormOpen(false); // Close the form upon submission
    };

    // Initialize WebSocket connection once roomId is available
    useEffect(() => {
        if (!roomId) return;

        webSocketRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_GAME_WS}/game/?role=${role}&roomId=${roomId}`);

        webSocketRef.current.onopen = () => {
            console.log('WebSocket connection established');
            setIsWebSocketConnected({ connected: true, errMessage: undefined });
        };

        webSocketRef.current.onmessage = (event) => {
            if (event.data instanceof Blob) {
                const url = URL.createObjectURL(event.data);
                if (event.data.size > 0) {
                    console.log(event.data);
                }
                setAction(prevPath => [...prevPath, {type: 'render', url: url}]);
                // console.log(url);
                return
            }
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
                alert('Correct answer by: ' + data.winner + '!\n' + "correct answer was: " + data.correctAnswer);
            }
            else if(data.type === 'req-snapshot') {
                setAction(prevPath => [...prevPath, data]);
            }
        };

        webSocketRef.current.onclose = (event) => {
            console.log('WebSocket connection closed', event.code);
            if (event.code === 4002) {
                setIsWebSocketConnected({ connected: false, errMessage: "Too many admins" });
            }
            else if (event.code === 4001) {
                setIsWebSocketConnected({ connected: false, errMessage: "Room not found" });
            } else {
                setIsWebSocketConnected({ connected: false, errMessage: "Unknown error" });
            }
        };

        webSocketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsWebSocketConnected({ connected: false, errMessage: "Unknown error" });
        };

        // Clean up the WebSocket connection when the component unmounts
        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, [roomId, role]);


    const sendChatMessage = useCallback((messageContent: string) => {
        if (!userContext?.user?.username) {
            console.log('Username is not loaded yet');
            return;
        }
        const message = {
            type: 'chat',
            text: messageContent,
            sender: userContext.user.username,
        };

        webSocketRef.current?.send(JSON.stringify(message));
        console.log('messages', message);
        setMessages(prevMessages => [...prevMessages, message]);
    }, [userContext?.user?.username]);

    const sendDrawAction = useCallback((type: string, point?: Point, snapshot?: Blob) => {
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
        else if(type === 'snapshot') {
            
            if(snapshot) 
                webSocketRef.current?.send(snapshot);
            else
                console.log(snapshot);
        }
    }, []);

    return (

        < div className="flex flex-col h-screen" >
            <Header onOpenForm={handleOpenForm} />
            {
                isWebSocketConnected.connected ? (
                    <main className="flex flex-1">
                        <DrawingCanvas actions={action} setActions={setAction} sendDrawAction={sendDrawAction} />
                        <StartForm isOpen={isFormOpen} onClose={handleCloseForm} onSubmit={handleSubmitForm} />
                        <ChatWindow messages={messages} sendChatMessage={sendChatMessage} />
                    </main>
                ) : (
                    isWebSocketConnected.errMessage ? <div>{isWebSocketConnected.errMessage}</div> : <div>Loading...</div>
                )
            }
        </div >
    );
};

export default RoomPage;