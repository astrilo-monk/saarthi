/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file
 */

/**
 * Collection ID: counselors
 * Interface for Counselors
 */
export interface Counselors {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  counselorName?: string;
  specialty?: string;
  bio?: string;
  /** image - Contains image URL, render with <Image> component, NOT as text */
  profilePicture?: string;
  isOnlineAvailable?: boolean;
  isInPersonAvailable?: boolean;
  languagesSpoken?: string;
}


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


/**
 * Collection ID: resources
 * Interface for Resources
 */
export interface Resources {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  title?: string;
  description?: string;
  resourceType?: string;
  contentUrl?: string;
  /** image - Contains image URL, render with <Image> component, NOT as text */
  thumbnailImage?: string;
  language?: string;
}


/**
 * Collection ID: testimonials
 * Interface for Testimonials
 */
export interface Testimonials {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  studentName?: string;
  quote?: string;
  /** image - Contains image URL, render with <Image> component, NOT as text */
  studentPhoto?: string;
  dateSubmitted?: Date | string;
  programOfStudy?: string;
  isApproved?: boolean;
}
