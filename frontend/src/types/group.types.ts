export interface Group {
  _id: string;
  name: string;
  description?: string;
  leader: memberDetails;
  members: memberDetails[];
}

export interface memberDetails {
  _id: string;
  username: string;
  email: string;
}
