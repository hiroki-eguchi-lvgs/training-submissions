export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: unknown; output: unknown; }
  LocalTime: { input: unknown; output: unknown; }
  Url: { input: unknown; output: unknown; }
};

export type Card = {
  __typename?: 'Card';
  currentStamps?: Maybe<Scalars['Int']['output']>;
  generation?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  stampHistories: Array<StampHistory>;
};

export type Group = {
  __typename?: 'Group';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  scheduledStartAt: Scalars['LocalTime']['output'];
  slackChannelUrl: Scalars['Url']['output'];
  stampsToReward: Scalars['Int']['output'];
};

export type GroupAddMemberPayload = {
  __typename?: 'GroupAddMemberPayload';
  group?: Maybe<Group>;
};

export type GroupChangeMemberRolePayload = {
  __typename?: 'GroupChangeMemberRolePayload';
  group?: Maybe<Group>;
};

export type GroupCreatePayload = {
  __typename?: 'GroupCreatePayload';
  group?: Maybe<Group>;
};

export type GroupDetail = {
  __typename?: 'GroupDetail';
  currentMembership?: Maybe<Membership>;
  groupId: Scalars['ID']['output'];
  memberships: Array<Membership>;
  stampIssuerUserId: Scalars['ID']['output'];
};

export type GroupInput = {
  name: Scalars['String']['input'];
  scheduledStartAt: Scalars['LocalTime']['input'];
  slackChannelUrl: Scalars['Url']['input'];
  stampIds: Array<Scalars['ID']['input']>;
  stampsToReward: Scalars['Int']['input'];
};

export type GroupStampPayload = {
  __typename?: 'GroupStampPayload';
  group?: Maybe<Group>;
};

export type GroupUpdatePayload = {
  __typename?: 'GroupUpdatePayload';
  group?: Maybe<Group>;
};

export type Me = {
  __typename?: 'Me';
  migratingStatus: MigratingStatus;
  userId: Scalars['ID']['output'];
};

export type Membership = {
  __typename?: 'Membership';
  currentCard?: Maybe<Card>;
  id: Scalars['ID']['output'];
  roles: Array<RoleCode>;
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type MigratingStatus =
  | 'MIGRATED'
  | 'MIGRATING'
  | 'PENDING';

export type Mutation = {
  __typename?: 'Mutation';
  groupAddMember?: Maybe<GroupAddMemberPayload>;
  groupChangeMemberRole?: Maybe<GroupChangeMemberRolePayload>;
  groupCreate?: Maybe<GroupCreatePayload>;
  groupStamp?: Maybe<GroupStampPayload>;
  groupUpdate?: Maybe<GroupUpdatePayload>;
  userUpdate?: Maybe<UserUpdatePayload>;
};


export type MutationGroupAddMemberArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGroupChangeMemberRoleArgs = {
  id: Scalars['ID']['input'];
  roleCode: Scalars['String']['input'];
  successorId: Scalars['ID']['input'];
};


export type MutationGroupCreateArgs = {
  input?: InputMaybe<GroupInput>;
};


export type MutationGroupStampArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGroupUpdateArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<GroupInput>;
};


export type MutationUserUpdateArgs = {
  migratingStamps?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  card: Card;
  group: Group;
  groupDetail: GroupDetail;
  groupMemberships: Array<Membership>;
  groups: Array<Group>;
  me: Me;
};


export type QueryCardArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryGroupArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGroupDetailArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryGroupMembershipsArgs = {
  id: Scalars['ID']['input'];
};

export type RoleCode =
  | 'ROLE_REWARD_MANAGER'
  | 'ROLE_STAMP_ISSUER';

export type Stamp = {
  __typename?: 'Stamp';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imagePath: Scalars['String']['output'];
};

export type StampHistory = {
  __typename?: 'StampHistory';
  createdAt: Scalars['DateTime']['output'];
  stampImagePath: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UserUpdatePayload = {
  __typename?: 'UserUpdatePayload';
  user?: Maybe<User>;
};
