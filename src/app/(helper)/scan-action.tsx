import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';

export default function ScanActionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(ROUTES.HELPER.DASHBOARD);
  }, []);
  return null;
}
