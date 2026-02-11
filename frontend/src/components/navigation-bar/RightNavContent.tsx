import { Flex, Button, Stack } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router";
import { logout } from "@/utils/authentication";

import { useUser } from "@/contexts/UserContext";
import { ColorModeButton } from "../ui/color-mode";

export default function RightNavContent() {
  const { isLoggedIn, refreshUserData } = useUser();

  const nav = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      await refreshUserData();
      nav("/login");
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
        <ColorModeButton />

        {!isLoggedIn && (
          <Button variant="solid" size="sm" onClick={() => nav("/login")}>
            Log In / Sign Up
          </Button>
        )}
        {isLoggedIn && (
          <>
            <NavLink to="/dashboard">
              <Button variant="solid" size="sm">
                Dashboard
              </Button>
            </NavLink>
            <Button variant="solid" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          </>
        )}
      </Stack>
    </Flex>
  );
}
