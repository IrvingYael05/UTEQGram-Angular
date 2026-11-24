export interface Post {
  id: string;
  title: string;
  location: string;
  image: string;
}

export interface SyncPost {
  id: string;
  title: string;
  location: string;
  picture: Blob | null;
}
