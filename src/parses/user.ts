interface UserRequest {
  _id: string;
}

export interface UserResponse {
  _id: string;
}

export const responseUser = ({ _id }: UserRequest): UserResponse => ({
  _id,
});
