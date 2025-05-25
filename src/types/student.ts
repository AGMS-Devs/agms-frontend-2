export interface Student {
  id: string;
  studentNumber: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  departmentId: string;
  advisorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 