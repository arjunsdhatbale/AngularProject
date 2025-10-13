 // src/app/models/user.model.ts
export interface User {
  id?: number;
  userName: string;
  email: string;
  password: string;
}

export interface UserDto {
  userName?: string;
  email?: string;
  password?: string;
}