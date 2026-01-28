import { Input, Flex, Box } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { debounce } from "lodash";

import { getStudents, type StudentResponse } from "@/utils/apiCalls";

export default function StudentSearch() {
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<StudentResponse[]>([]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [studentData, setStudentData] = useState<StudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadStudents() {
      try {
        setIsLoading(true);
        const res = await getStudents();
        setStudentData(res);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadStudents();
  }, []);

  const debounceOnChange = debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.trim().toLowerCase();
      const filteredResults = studentData.filter((usr) => {
        const firstName = usr.first_name?.toLowerCase() || "";
        const lastName = usr.last_name?.toLowerCase() || "";
        const fullName = `${firstName} ${lastName}`;
        const email = usr.email?.toLowerCase() || "";

        return (
          firstName.includes(input) ||
          lastName.includes(input) ||
          fullName.includes(input) ||
          email.includes(input)
        );
      });
      setSearchResults(filteredResults);
      setMenuIsOpen(filteredResults.length > 0);
    },
    500,
  );

  const getAnchorRect = () => inputRef.current?.getBoundingClientRect();

  useEffect(() => {
    if (
      menuIsOpen &&
      inputRef.current &&
      document.activeElement !== inputRef.current
    ) {
      inputRef.current.focus();
    }
  }, [menuIsOpen]);

  if (isLoading) return <div>Loading students...</div>;
  if (error) return <div> Error: {error}</div>;
  return (
    <Flex direction="column">
      <Input
        placeholder="Enter a name or email"
        ref={inputRef}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          debounceOnChange(e);
        }}
        onFocus={() => {
          if (searchResults.length > 0) setMenuIsOpen(true);
        }}
      />
      {menuIsOpen && searchResults.length > 0 && (
        <Flex
          positioning={{ getAnchorRect }}
          direction="column"
          border="1px solid"
          borderColor="bg.sidebar"
          rounded="md"
          mt={1}
          w="full"
          boxShadow="sm"
          maxH="240px"
          overflowY="auto"
          zIndex={999}
        >
          {searchResults.map((usr) => (
            <Box
              key={usr.id}
              cursor="default"
              px={3}
              py={2}
              _hover={{
                bg: "bg.secondaryBtnHover",
              }}
            >
              <h1>
                {usr.first_name} {usr.last_name}
              </h1>
            </Box>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
