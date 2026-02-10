"use client";

import { useState } from "react";
import {
  Checkbox,
  Text,
  Flex,
  Field,
  Input,
  Stack,
  Button,
} from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router";

import { toaster } from "@/components/ui/toaster";
import { login, type LoginCredentials } from "../utils/authentication";
import { useUser } from "@/contexts/UserContext";

interface LoginError {
  message: string;
}

export default function LoginForm() {
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const { refreshUserData } = useUser();

  const nav = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    const credentials: LoginCredentials = { email, password };

    const loginPromise = login(credentials);

    toaster.promise(loginPromise, {
      loading: {
        title: "Logging In...",
        description: "Checking your credentials.",
      },
      success: {
        title: "Login Successful!",
        description: "Redirecting to your dashboard.",
      },
      error: { title: "Error", description: "Login failed." },
    });

    try {
      await loginPromise;
      setLoginError(null);
      await refreshUserData();
      nav("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setLoginError({ message: err.message });
      } else {
        setLoginError({ message: "An unexpected error occurred during login" });
      }
      console.error(err);
    }
  }

  return (
    <Flex
      direction="column"
      gap={4}
      py={2}
      align="center"
      justify="center"
      flex="1"
      mt="-8rem"
    >
      <Flex as="form" onSubmit={handleSubmit} justify="center" w="100%">
        <Flex
          mt={2}
          justify="center"
          direction="column"
          gap={4}
          py={6}
          w="50%"
          p={6}
          borderRadius="1rem"
        >
          <Text textAlign="center" textStyle="heading.xl">
            Login
          </Text>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Email Address</Field.Label>
            <Input
              borderColor="borders"
              type="email"
              placeholder="email address"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>

          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Password</Field.Label>
            <Input
              type={checked ? "text" : "password"}
              placeholder="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Checkbox.Root
            color="text.sidebar"
            px={4}
            checked={checked}
            onCheckedChange={(e) => setChecked(!!e.checked)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Show password</Checkbox.Label>
          </Checkbox.Root>
          {loginError && (
            <Text fontSize="sm" color="red.400">
              {loginError.message}
            </Text>
          )}
          <Button
            mx={4}
            mt={2}
            type="submit"
            textStyle="xl"
            _hover={{ bg: "bg.secondaryBtnHover" }}
          >
            Log In
          </Button>

          <Stack mx={4} pt={3} color="text.sidebar">
            Don't have an account yet? <NavLink to="/signup">Signup</NavLink>
            <NavLink to="/forgotPassword">Forgot password?</NavLink>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  );
}
