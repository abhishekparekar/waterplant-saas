export type StaffStatus = 'active' | 'inactive';

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  role: 'helper' | 'driver' | 'manager';
  status: StaffStatus;
  vehicleNumber?: string;
  assignedRoute?: string;
  salaryOrCommission?: string;
  address?: string;
  ownerId: string;
  businessName: string;
  totalDeliveriesCompleted: number;
  todayDeliveries: number;
  createdAt: string;
  updatedAt: string;
}
