import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { verifyJWT } from "../utils/authentication";
import { type AuthResponse } from "../utils/authentication";

export interface UserContextType {
  userData: AuthResponse | {};
  setUserData: Dispatch<SetStateAction<AuthResponse | {}>>;
  isLoggedIn: boolean;
  refreshUserData: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

type Props = {
  children: ReactNode;
};

export const UserContextProvider = ({ children }: Props) => {
  const [userData, setUserData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await verifyJWT();
      if (currentUser.status !== "success") {
        setUserData({});
        setIsLoggedIn(false);
        return;
      }

      setUserData(currentUser.user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      setUserData({});
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        isLoggedIn,
        refreshUserData: loadUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
