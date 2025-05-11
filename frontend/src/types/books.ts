export interface Book {
  _id?: string;
  copyId: string;
  bookId: string;
  title: string;
  author: string;
  cost: number;
  isbn: string;
  category: string;
  location: string;
  status: "available" | "reserved" | "borrowed" | "lost" | "return_requested";
  publishedYear: string;
  numOfPages: number;
}

export interface DigitalResource {
  _id?: string;
  resourceId: string;
  title: string;
  author: string;
  category: string;
  fileUrl: string;
  cost: number;
  publishedYear: number;
}
