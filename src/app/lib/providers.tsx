"use client";

import { UserProvider } from "./context/UserContext";

export const Providers = (props: React.PropsWithChildren) => {
  return (
    <UserProvider>
      {props.children}
    </UserProvider>
  );
};