export type UserRole = "admin" | "manager" | "salesperson" | "viewer";

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
