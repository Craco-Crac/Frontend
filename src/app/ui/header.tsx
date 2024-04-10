'user client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserContext } from "@/app/lib/context/UserContext";
import { usersApi } from "@/config/axios.config";

const Header = () => {
    const userContext = useUserContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get('roomId');
    const handleLogout = () => {
        console.log('Logging out...');
        usersApi.get('/auth/logout').then(() => {
            router.push('/login');
        }).catch(err => {
            console.log(err);
        });
    };

    return (
        <header className="flex justify-between items-center p-4 bg-white shadow-md">
            <span onClick={() => router.push('/')} className="text-blue-600 cursor-pointer">
                {/* Replace with an actual icon */}
                🏠 Home
            </span>
            {roomId ? <span className="text-black mr-4">Room ID: {roomId}</span> : null}
            <div>
                <span className="text-black font-semibold">{userContext?.user?.username}</span>
                <button onClick={handleLogout} className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
