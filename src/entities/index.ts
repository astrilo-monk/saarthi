/**
 * Entity types for Saarthi platform
 * Forum entities are now served by the Spring Boot backend.
 * This file is kept for any future frontend-only type definitions.
 */

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  anonymousAuthor: string;
  scope: 'CAMPUS' | 'GLOBAL';
  collegeId: string | null;
  collegeName: string | null;
  createdAt: string;
  commentCount: number;
  comments: ForumComment[];
}

export interface ForumComment {
  id: string;
  postId: string;
  content: string;
  anonymousAuthor: string;
  createdAt: string;
}
