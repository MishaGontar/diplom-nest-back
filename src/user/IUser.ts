export interface IUser {
  id: number;
  username: string;
  email: string;
  is_activated: boolean;
  images: {
    image_url: string;
  };
  sellers: { id: number } | null;
}
