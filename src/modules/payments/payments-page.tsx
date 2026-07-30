import React from 'react';
import { FinancesDashboard, type FinancesDashboardProps } from '../finances/finances-dashboard';

export const PaymentsPage: React.FC<FinancesDashboardProps> = (props) => {
  return <FinancesDashboard {...props} />;
};

export default PaymentsPage;
