// src/pages/Index.tsx

import { useNavigate } from 'react-router-dom';
import CyberLanding from '@/components/CyberLanding';

const Index = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/interview');
  };

  // Pass the handleStart function as a prop
  return <CyberLanding onStart={handleStart} />;
};

export default Index;