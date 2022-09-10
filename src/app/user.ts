// export class User {
//   name: string;
//   email: string;
// }

export class UserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  eMail: string;
  organizationId: string;
  role: number;
}

export class Satellite {
  addressList: [];
  displayName: string;
  certSha256: string;
}

export class UserData {
  sessionId: string;
  authToken: string;
  satellites: Satellite[];
  userInfo: UserInfo;
}
