export type TeacherStatus = "pending" | "approved" | "rejected";

export type TeacherAvailabilityStatus = "available" | "busy" | "paused";

export interface TeacherProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  subjects: string[];
  languages: string[];
  shortDescription: string;
  description: string;
  individualPrice: number;
  groupPrice?: number;
  offersIndividual: boolean;
  offersGroup: boolean;
  curriculumImageUrl: string;
  certificates?: string[];
  availability?: string;
  availabilityStatus: TeacherAvailabilityStatus;
  status: TeacherStatus;
  rejectionReason?: string;
  rating?: number;
  reviewsCount?: number;
  createdAt: number;
  updatedAt: number;
}