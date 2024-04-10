import React, { useState } from 'react';

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
            <div className="p-4 overflow-auto">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2 last:mb-0 p-2 bg-white rounded shadow text-black">
                        <strong>{msg.sender}</strong> {msg.date ? <small>{msg.date}</small> : null}
                        <p>{msg.text}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col p-4 border-t border-gray-300">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="mb-4 w-full p-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                />
                <button
                    type="submit"
                    className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
