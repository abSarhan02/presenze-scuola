export type UserRole = 'admin' | 'operator' | 'parent';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  assignedClassIds?: string[]; 
  childIds?: string[];        
}

export interface School {
  id: string;
  name: string;
}

export interface ClassItem {
  id: string;
  schoolId: string;
  name: string;
}

export interface Child {
  id: string;
  schoolId: string;
  classId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  parentNames?: string;
}

export interface Attendance {
  id?: string;
  childId: string;
  classId: string;
  date: string;      
  isPresent: boolean;
  timestamp?: number; 
}