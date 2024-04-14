import React, { useState } from 'react';
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

type ChatMessage = {
    sender: string;
    text: string;
    date?: string;
};

type ChatWindowProps = {
    messages: ChatMessage[];
    sendChatMessage: (message: string) => void;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, sendChatMessage }) => {
    const [message, setMessage] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendChatMessage(message);
        setMessage('');
    };

    return (
        <div className="flex flex-col justify-between h-full bg-gray-100 border-l border-gray-300">
            <div className="p-4 overflow-auto max-h-[65vh]">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2 last:mb-0 p-2 bg-white rounded shadow text-black">
                        <strong>{msg.sender}</strong> {msg.date ? <small>{msg.date}</small> : null}
                        <p>{msg.text}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col p-4 border-t border-gray-300">
                <div className="relative w-full">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="pl-4 pr-10 w-full border rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        aria-label="Send message"
                    >
                        <PaperAirplaneIcon className="h-5 w-5 text-blue-500 transform -rotate-45" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
