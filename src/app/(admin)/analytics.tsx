import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Legacy Analytics page has been completely removed and replaced by the
 * dedicated Platform Revenue & Collections Reports screen.
 */
export default function AnalyticsRedirect() {
  return <Redirect href="/(admin)/reports" />;
}
