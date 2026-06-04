export type TeacherStatus = "pending" | "approved" | "rejected";

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
  status: TeacherStatus;
  rejectionReason?: string;
  rating?: number;
  reviewsCount?: number;
  createdAt: number;
  updatedAt: number;
}