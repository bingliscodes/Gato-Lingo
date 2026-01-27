"use client";

import { useState } from "react";
import { Field, Input, Stack, Button, Flex, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";
import { useContext } from "react";

import { UserContext } from "@/contexts/UserContext";
import { toaster } from "@/components/ui/toaster";
import { signup } from "../utils/js/authentication";

export default function SignupCard() {
  const [signupError, setSignupError] = useState(false);
  const { refreshUserData } = useContext(UserContext);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const entries = Object.fromEntries(formData.entries());

    const signupPromise = signup(entries);

    toaster.promise(signupPromise, {
      loading: {
        title: "Signing up...",
        description: "Creating your account..",
      },
      success: {
        title: "Signup Successful!",
        description: "Redirecting to homepage.",
      },
      error: (err) => ({
        title: "Signup Failed",
        description: err.message || "An unexpected error occurred!",
      }),
    });

    try {
      await signupPromise;
      setSignupError(false);
      await refreshUserData();
    } catch (err) {
      setSignupError(err);
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
          direction="column"
          gap={4}
          py={6}
          w="50%"
          p={6}
          borderRadius="1rem"
          bgGradient="sidebar"
        >
          <Text fontSize="xl" fontWeight="bold" color="text.sidebar">
            Create an account to get started!
          </Text>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>First Name</Field.Label>
            <Input
              borderColor="borders"
              type="text"
              placeholder="first name"
              _placeholder={{
                color: "text.sidebar/60",
              }}
              name="firstName"
              _focus={{ borderColor: "bg.primaryBtn" }}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Last Name</Field.Label>
            <Input
              borderColor="borders"
              type="text"
              placeholder="last name"
              _placeholder={{
                color: "text.sidebar/60",
              }}
              name="lastName"
              _focus={{ borderColor: "bg.primaryBtn" }}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Email Address</Field.Label>
            <Input
              borderColor="borders"
              type="email"
              placeholder="email address"
              _placeholder={{
                color: "text.sidebar/60",
              }}
              name="email"
              _focus={{ borderColor: "bg.primaryBtn" }}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label> Password</Field.Label>
            <Input
              borderColor="borders"
              type="text"
              placeholder="password"
              _placeholder={{
                color: "text.sidebar/60",
              }}
              name="password"
              _focus={{ borderColor: "bg.primaryBtn" }}
            />
            <Field.ErrorText></Field.ErrorText>
          </Field.Root>
          <Field.Root px={4} color="text.sidebar">
            <Field.Label>Confirm Password</Field.Label>
            <Input
              borderColor="borders"
              type="text"
              placeholder="confirm password"
              _placeholder={{
                color: "text.sidebar/60",
              }}
              name="passwordConfirm"
              _focus={{ borderColor: "bg.primaryBtn" }}
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
