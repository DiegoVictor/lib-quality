export interface UserResponse {
  _id: string;
  token: string;
}

export const responseUser = (_id: string, token: string): UserResponse => ({
  _id,
  token,
});
