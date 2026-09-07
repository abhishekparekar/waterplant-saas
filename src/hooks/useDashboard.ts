import { useState, useEffect, useCallback } from 'react';
import { reportService, DashboardReportSummary } from '@/services/reportService';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardReportSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await reportService.getDashboardSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};
