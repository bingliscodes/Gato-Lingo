import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { verifyJWT, type User } from "../utils/authentication";

export interface UserContextType {
  userData: User | null;
  setUserData: (user: User | null) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

type Props = {
  children: ReactNode;
};

export const UserContextProvider = ({ children }: Props) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = userData !== null;

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await verifyJWT();
      setUserData(currentUser.user);
    } catch (err) {
      console.error("Failed to verify user:", err);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const value: UserContextType = {
    userData,
    setUserData,
    isLoggedIn,
    isLoading,
    refreshUserData: loadUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }

  return context;
};
