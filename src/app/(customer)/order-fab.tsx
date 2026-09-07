import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';

export default function OrderFabRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(ROUTES.CUSTOMER.DASHBOARD);
  }, []);
  return null;
}
