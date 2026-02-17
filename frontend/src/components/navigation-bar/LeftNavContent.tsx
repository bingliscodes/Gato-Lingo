import { Flex, Button, Stack } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import { useUser } from '@/contexts/UserContext';
import LogoIcon from '@/assets/gatolingo-logo.svg?react';
import { startDemo, type ExamFormData } from '@/utils/apiCalls';
interface LogoProps {
  fill?: string;
  stroke?: string;
  width?: string | number;
  height?: string | number;
}

const Logo = ({
  fill = 'currentColor',
  stroke,
  width = 48,
  height = 48,
}: LogoProps) => (
  <LogoIcon
    fill={fill}
    width={width}
    height={height}
    stroke={stroke}
    style={{ display: 'block' }}
  />
);

export default function LeftNavContent() {
  const { isLoggedIn, refreshUserData } = useUser();

  const nav = useNavigate();
  const handleDemo = async () => {
    try {
      const demoData: ExamFormData = {
        title: 'Demo Exam',
        description: 'Demo description',
        topic: 'How cool cats are',
        target_language: 'spanish',
        difficulty_level: 'beginner',
        tenses: ['present', 'preterite'],
      };
      const demoRes = await startDemo(demoData);
      console.log(demoRes);
      await refreshUserData();
      nav('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  };

  return (
    <Flex>
      <Stack direction="row" align="center">
        <Logo width="4rem" height="4rem" fill="white" />
        {!isLoggedIn && (
          <Button variant="solid" size="sm" onClick={handleDemo}>
            Demo
          </Button>
        )}
      </Stack>
    </Flex>
  );
}
