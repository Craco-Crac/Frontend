'use client';
import React, { useState, ChangeEvent } from 'react';
import { gameApi } from "@/config/axios.config";
import { isAxiosError } from "axios";
import { useRouter } from 'next/navigation';
import Header from '@/app/ui/header';

const MainPage: React.FC = () => {
  const [roomID, setRoomID] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState<boolean>(false);
  const [numberOfAdmins, setNumberOfAdmins] = useState<number>(1);
  const { push } = useRouter();

  const handleCreateRoomToggle = () => {
    setShowCreateRoomModal(!showCreateRoomModal);
  };

  const handleCreateRoom = async () => {
    console.log('Creating room with ' + numberOfAdmins + ' admins...');
    setError(null);

    try {
      const response = await gameApi.post("/create", { "admins": numberOfAdmins });
      if (response.status === 201) {
        console.log(response.data);
        push(`/game/?role=admin&roomId=` + response.data.roomId);
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        console.log(error.response?.data);
        error.response?.data.message ?
          setError(error.response?.data.message) : setError(error.message);
      } else {
        setError("Undefined error");
      }
    }

    setShowCreateRoomModal(false);
  };

  const handleJoinAsAdmin = (): void => {
    console.log(`Joining room ${roomID} as admin...`);
    push(`/game/?role=admin&roomId=` + roomID);
  };

  const handleJoinAsUser = (): void => {
    push(`/game/?role=user&roomId=` + roomID);
    console.log(`Joining room ${roomID} as user...`);
  };

  return (
    <> <Header />
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-md w-full">
          <h1 className="text-center text-2xl mb-4 text-gray-800">Main Page</h1>

          <button
            onClick={handleCreateRoomToggle}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
          >
            Create Room
          </button>

          {/* Modal for Create Room settings */}
          {showCreateRoomModal && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg z-10">
              <h2 className="text-xl font-bold mb-4">Room Settings</h2>
              <div className="mb-4">
                <label htmlFor="numberOfAdmins" className="block text-gray-700 text-sm font-bold mb-2">
                  Number of Admins:
                </label>
                <input
                  type="number"
                  id="numberOfAdmins"
                  value={numberOfAdmins}
                  onChange={(e) => setNumberOfAdmins(parseInt(e.target.value))}
                  className="shadow border rounded py-2 px-3 text-gray-700"
                  min="1"
                />
              </div>
              <button
                onClick={handleCreateRoom}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create
              </button>
              <button
                onClick={handleCreateRoomToggle}
                className="bg-transparent hover:bg-gray-100 text-blue-700 font-semibold py-2 px-4 border border-blue-500 rounded ml-4"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="roomID" className="block text-gray-700 text-sm font-bold mb-2">
              Room ID
            </label>
            <input
              type="text"
              id="roomID"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter Room ID"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleJoinAsAdmin}
            >
              Join as Admin
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleJoinAsUser}
            >
              Join as User
            </button>
          </div>
          {error && <div className="alert alert-error text-red-400">{error}</div>}
        </div>
      </div>
    </>
  );
};

export default MainPage;
