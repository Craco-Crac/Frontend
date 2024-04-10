import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { usersApi } from "@/config/axios.config";

export interface User {
    id: string;
    username: string;
    iat: number;
    exp: number;
}

interface ContextData {
    user: User | undefined;
    setUser: Dispatch<SetStateAction<User | undefined>>;
}

const UserContext = createContext<ContextData | undefined>(undefined);

export const useUserContext = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }: React.PropsWithChildren) => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser]: [ContextData["user"], ContextData["setUser"]] = useState();

    useEffect(() => {
        if (pathname != "/register" && pathname != "/login") {
            usersApi
                .get("/auth/check")
                .then((response) => setUser(response.data))
                .catch(() => {
                    router.push("/login");
                });
        }
    }, [router, pathname]); //eslint-disable-line

    const initialContextValue: ContextData = {
        user,
        setUser,
    };

    return <UserContext.Provider value={initialContextValue}>{children}</UserContext.Provider>;
};