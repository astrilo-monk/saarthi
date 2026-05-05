/**
 * Entity types for Saarthi platform
 * Only active entities are exported
 */

/**
 * Collection ID: forumcategories
 * Interface for ForumCategories
 */
export interface ForumCategories {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  categoryName?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
  slug?: string;
}
