export type UserRole = 'OWNER' | 'TRAINER';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  trainerId?: number;
}

export interface Member {
  id: number;
  member_code: string;
  full_name: string;
  photo_url?: string;
  dob?: string;
  gender?: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  membership_type:
    | 'Monthly'
    | 'Quarterly'
    | 'Half-Yearly'
    | 'Annual';
  start_date: string;
  expiry_date: string;
  payment_status:
    | 'Paid'
    | 'Pending'
    | 'Overdue';
  assigned_trainer_id?: number;
  trainer_name?: string;
  registration_date: string;
  notes?: string;
}

export interface Trainer {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience_years: number;
  joining_date: string;
  status: 'Active' | 'Inactive';
  bio?: string;
  photo_url?: string;
  assigned_members_count?: number;
}

export interface Attendance {
  id: number;
  member_id: number;
  member_code: string;
  member_name: string;
  phone?: string;
  membership_type?: string;
  date: string;
  check_in_time: string;
  status: 'Present' | 'Absent';
  marked_by_name?: string;
}

export interface Payment {
  id: number;
  member_id: number;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  amount: number;
  payment_date: string;
  payment_method:
    | 'Cash'
    | 'UPI'
    | 'Card'
    | 'Bank Transfer';
  membership_plan: string;
  status:
    | 'Completed'
    | 'Pending'
    | 'Failed';
  transaction_id: string;
  notes?: string;
}

export interface Equipment {
  id: number;
  name: string;
  category:
    | 'Cardio'
    | 'Strength'
    | 'Free Weights'
    | 'Accessories';
  quantity: number;
  purchase_date?: string;
  condition:
    | 'New'
    | 'Good'
    | 'Fair'
    | 'Poor';
  maintenance_date?: string;
  status:
    | 'Working'
    | 'Needs Maintenance'
    | 'Under Repair';
  notes?: string;
}

export interface FitnessProgress {
  id: number;
  member_id: number;
  member_name?: string;
  trainer_id: number;
  trainer_name?: string;
  record_date: string;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  body_fat_pct?: number;
  chest_in?: number;
  waist_in?: number;
  biceps_in?: number;
  notes?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type:
    | 'expiry'
    | 'payment'
    | 'maintenance'
    | 'system'
    | 'info';
  recipient_role:
    | 'OWNER'
    | 'TRAINER'
    | 'ALL';
  is_read: number;
  created_at: string;
}

export interface GymSettings {
  gym_name?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  currency?: string;
  tax_rate?: string;
  opening_hours?: string;
}