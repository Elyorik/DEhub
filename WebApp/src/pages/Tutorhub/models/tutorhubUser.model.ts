export type TutorhubRole = "student" | "teacher" | "admin";

export type TutorhubProfileStatus = "missing" | "pending" | "approved" | "rejected";

export interface TutorhubUserProfile {
  uid: string;
  role: TutorhubRole;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  profileStatus: TutorhubProfileStatus;
  rejectionReason?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  age?: string;
  classLevel?: string;
  subjects: string[];
  learningGoal: string;
  preferredFormat: "individual" | "group" | "both";
  availability?: string;
  notes?: string;
  profileStatus: TutorhubProfileStatus;
  rejectionReason?: string;
  createdAt: number;
  updatedAt: number;
}