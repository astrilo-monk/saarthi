export type DataItem = {
  _id?: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  [key: string]: any;
};

export type DataQueryResult = {
  items: DataItem[];
  totalCount?: number;
  hasNext: () => boolean;
};
