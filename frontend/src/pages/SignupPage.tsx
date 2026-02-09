"use client";

import { useState } from "react";
import { Field, Input, Stack, Button, Flex, Text } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router";
import { toaster } from "@/components/ui/toaster";

import { useUser } from "@/contexts/UserContext";
import { signup } from "../utils/authentication";

interface UserSignupRequest {
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  email: string;
  role: string;
}

interface SignupError {
  message: string;
}

export default function SignupCard() {
  const [signupError, setSignupError] = useState<SignupError | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [checked, setChecked] = useState(false);
  const { refreshUserData } = useUser();

  const nav = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    const signupData: UserSignupRequest = {
      email,
      password,
      password_confirm: passwordConfirm,
      first_name: firstName,
      last_name: lastName,
      role,
    };
    const signupPromise = signup(signupData);

    toaster.promise(signupPromise, {
      loading: {
        title: "Signing up...",
        description: "Creating your account..",
      },
      success: {
        title: "Signup Successful!",
        description: "Redirecting to homepage.",
      },
      error: { title: "Error", description: "Login failed." },
    });

    try {
      await signupPromise;
      setSignupError(null);
      await refreshUserData();
      nav("/");
    } catch (err) {
      if (err instanceof Error) {
        setSignupError({ message: err.message });
      } else {
        setSignupError({
          message: "An unexpected error has occurred during signup.",
        });
      }
      console.error(err);
    }
  }

  return (
    <Flex
      direction="column"
      py={2}
      align="center"
      mt="-12rem"
      flex="1"
      justify="center"
    >
      <Flex as="form" onSubmit={handleSubmit} w="100%" justify="center">
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
          <Text fontSize="xl" fontWeight="bold" color="text.sidebar">
            Create an account to get started!
          </Text>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>First Name</Field.Label>
            <Input
              type="text"
              placeholder="first name"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Last Name</Field.Label>
            <Input
              type="text"
              placeholder="last name"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Email Address</Field.Label>
            <Input
              type="email"
              placeholder="email address"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label> Password</Field.Label>
            <Input
              type="text"
              placeholder="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Confirm Password</Field.Label>
            <Input
              type="text"
              placeholder="confirm password"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Role</Field.Label>
            <Input
              type="text"
              placeholder="Enter role (student or teacher)"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          {signupError && (
            <Text fontSize="sm" color="red.400">
              {signupError.message}
            </Text>
          )}
          <Button
            mx={4}
            mt={2}
            type="submit"
            bg="bg.secondaryBtn"
            color="text.secondaryBtn"
            textStyle="xl"
            _hover={{ bg: "bg.secondaryBtnHover" }}
          >
            Sign Up
          </Button>
          <Stack pt={3} color="text.sidebar">
            Already a user? <NavLink to="/login">Login</NavLink>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  );
}
