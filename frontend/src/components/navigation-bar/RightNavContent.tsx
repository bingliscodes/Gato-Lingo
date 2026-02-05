import { Flex, Button, Stack } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router";
import { logout } from "@/utils/authentication";

import { useUser } from "@/contexts/UserContext";

export default function RightNavContent() {
  const { isLoggedIn, refreshUserData } = useUser();

  const nav = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      await refreshUserData();
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  return (
    <Flex>
      <Stack direction="row" align="center">
        <NavLink to="/dashboard">
          <Button variant="solid" size="sm">
            Dashboard
          </Button>
        </NavLink>
        {!isLoggedIn && (
          <Button variant="solid" onClick={() => nav("/login")}>
            Log In / Sign Up
          </Button>
        )}

        {isLoggedIn && (
          <>
            <Button variant="solid" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          </>
        )}
      </Stack>
    </Flex>
  );
}
