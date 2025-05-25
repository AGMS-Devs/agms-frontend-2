import { User } from "./auth";

export interface GraduationProcess {
  id: string;
  studentId: string;
  studentUser?: User;
  advisorApproved: boolean;
  departmentSecretaryApproved: boolean;
  facultyDeansOfficeApproved: boolean;
  studentAffairsApproved: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
} 