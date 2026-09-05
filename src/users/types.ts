export type FindUserCriteria = {
  email?: string;
};

export type CreateUserData = {
  email: string;
  password: string;
  roles?: string[];
};
