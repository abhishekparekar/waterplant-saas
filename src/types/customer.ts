export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  address: string;
  pricePerJar?: number;
  latitude?: number;
  longitude?: number;
  emptyBottlesHeld: number; // number of 20L empty bottles currently with customer
  depositPaid: number; // deposit amount paid for bottles
  balance: number; // outstanding balance (positive for unpaid dues, negative for credit)
  createdAt: string;
  updatedAt: string;
}

