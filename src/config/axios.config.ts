import axios from "axios";

export const usersApi = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_USERS_API,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});