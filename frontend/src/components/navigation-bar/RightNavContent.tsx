import { Flex, Button, Stack } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router";

import { useUser } from "@/contexts/UserContext";

export default function RightNavContent() {
  const { isLoggedIn } = useUser();

  const nav = useNavigate();
  const handleLogout = () => {};

  return (
    <Flex>
      <Stack direction="row" align="center">
        <Button borderRadius="lg" size="md" />

        {!isLoggedIn && (
          <Button borderRadius="lg" onClick={() => nav("/login")}>
            Log In / Sign Up
          </Button>
        )}

        {isLoggedIn && (
          <>
            <Button
              borderRadius="lg"
              onClick={() => {
                handleLogout();
              }}
            >
              Log Out
            </Button>

            <NavLink to="/dashboard">Dashboard</NavLink>
          </>
        )}
      </Stack>
    </Flex>
  );
}
