import { DataItem } from ".";

/**
 * Pagination options for querying collections
 */
export interface PaginationOptions {
  /** Number of items per page (default: 50, max: 1000) */
  limit?: number;
  /** Number of items to skip (for offset-based pagination) */
  skip?: number;
}

/**
 * Metadata for a multi-reference field (available on item._refMeta[fieldName])
 * Only populated by getById, not getAll
 */
export interface RefFieldMeta {
  /** Total count of referenced items */
  totalCount: number;
  /** Number of items returned */
  returnedCount: number;
  /** Whether there are more items beyond what was returned */
  hasMore: boolean;
}

/**
 * Paginated result with metadata for infinite scroll
 */
export interface PaginatedResult<T> {
  /** Array of items for current page */
  items: T[];
  /** Total number of items in the collection */
  totalCount: number;
  /** Whether there are more items after current page */
  hasNext: boolean;
  /** Current page number (0-indexed) */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Offset to use for next page */
  nextSkip: number | null;
}

/** Cache for fetched JSON data to avoid repeated network requests */
const dataCache = new Map<string, any[]>();

/**
 * Fetches data from a local JSON file in /data/{collectionId}.json
 */
async function fetchCollectionData<T>(collectionId: string): Promise<T[]> {
  if (dataCache.has(collectionId)) {
    return dataCache.get(collectionId) as T[];
  }

  try {
    const response = await fetch(`/data/${collectionId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch /data/${collectionId}.json: ${response.status}`);
    }
    const data = await response.json();
    dataCache.set(collectionId, data);
    return data as T[];
  } catch (error) {
    console.error(`Error fetching ${collectionId} data:`, error);
    return [];
  }
}

/**
 * Generic CRUD Service class for Data collections
 * Reads from static JSON files in /data/ directory
 */
export class BaseCrudService {
  /**
   * Retrieves items from the collection with pagination (default: 50 per page)
   */
  static async getAll<T extends DataItem>(
    collectionId: string,
    _includeRefs?: { singleRef?: string[]; multiRef?: string[] } | string[],
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    try {
      const limit = Math.min(pagination?.limit ?? 50, 1000);
      const skip = pagination?.skip ?? 0;

      const allItems = await fetchCollectionData<T>(collectionId);
      const paginatedItems = allItems.slice(skip, skip + limit);
      const hasNext = skip + limit < allItems.length;

      return {
        items: paginatedItems,
        totalCount: allItems.length,
        hasNext,
        currentPage: Math.floor(skip / limit),
        pageSize: limit,
        nextSkip: hasNext ? skip + limit : null,
      };
    } catch (error) {
      console.error(`Error fetching ${collectionId}s:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to fetch ${collectionId}s`
      );
    }
  }

  /**
   * Retrieves a single item by ID
   */
  static async getById<T extends DataItem>(
    collectionId: string,
    itemId: string,
    _includeRefs?: { singleRef?: string[]; multiRef?: string[] } | string[]
  ): Promise<T | null> {
    try {
      const allItems = await fetchCollectionData<T>(collectionId);
      return allItems.find(item => item._id === itemId) ?? null;
    } catch (error) {
      console.error(`Error fetching ${collectionId} by ID:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to fetch ${collectionId}`
      );
    }
  }

  /**
   * Creates a new item (stub - static data is read-only)
   */
  static async create<T extends DataItem>(
    collectionId: string,
    itemData: Partial<T> | Record<string, unknown>,
    _multiReferences?: Record<string, any>
  ): Promise<T> {
    console.warn(`Create operation not available for static data (${collectionId})`);
    return { _id: crypto.randomUUID(), ...itemData } as T;
  }

  /**
   * Updates an existing item (stub - static data is read-only)
   */
  static async update<T extends DataItem>(collectionId: string, itemData: T): Promise<T> {
    console.warn(`Update operation not available for static data (${collectionId})`);
    return itemData;
  }

  /**
   * Deletes an item by ID (stub - static data is read-only)
   */
  static async delete<T extends DataItem>(collectionId: string, itemId: string): Promise<T> {
    console.warn(`Delete operation not available for static data (${collectionId})`);
    return { _id: itemId } as T;
  }

  /**
   * Adds references (stub - static data is read-only)
   */
  static async addReferences(
    collectionId: string,
    _itemId: string,
    _references: Record<string, string[]>
  ): Promise<void> {
    console.warn(`addReferences not available for static data (${collectionId})`);
  }

  /**
   * Removes references (stub - static data is read-only)
   */
  static async removeReferences(
    collectionId: string,
    _itemId: string,
    _references: Record<string, string[]>
  ): Promise<void> {
    console.warn(`removeReferences not available for static data (${collectionId})`);
  }
}
