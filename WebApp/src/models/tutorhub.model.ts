import { User } from "./user.model";

export interface TutorHubPost {
  id: string;
  author: User;
  title: string;
  text: string;
  image?: string;
  likes: string[];          // userIds
  commentsCount: number;
  createdAt: number;
}

export interface TutorHubState {
  posts: TutorHubPost[];
}
