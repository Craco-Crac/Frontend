import React, { useState } from 'react';

export const StartForm: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (answer: string, delay: number) => void; }> = ({ isOpen, onClose, onSubmit }) => {
    const [answer, setAnswer] = useState('');
    const [delayUntilFinish, setDelayUntilFinish] = useState('');
    const [pending, setPending] = useState(false);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const delayNum = parseInt(delayUntilFinish, 10);
        if (!isNaN(delayNum)) {
            setPending(true);
            onSubmit(answer, delayNum);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Submit Answer</h3>
                    <form onSubmit={handleSubmit} className="mt-2">
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Answer"
                            className="mt-2 p-2 border rounded-md w-full text-black"
                        />
                        <input
                            type="number"
                            value={delayUntilFinish}
                            onChange={(e) => setDelayUntilFinish(e.target.value)}
                            placeholder="Delay Until Finish (seconds)"
                            className="mt-2 p-2 border rounded-md w-full text-black"
                        />
                        <div className="items-center px-4 py-3">
                            <button
                                id="ok-btn"
                                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                type="submit"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                    <div className="items-center px-4 py-3">
                        <button
                            aria-disabled={pending} disabled={pending}
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
