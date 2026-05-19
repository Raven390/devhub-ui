export type UUID = string;
export type ISODateTimeString = string;

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'RECRUITING' | 'ARCHIVED';
export type MemberStatus = 'OWNER' | 'ACTIVE' | 'INVITED' | 'LEFT' | 'REMOVED';

export interface UserDto {
  id: UUID;
  email: string;
  name: string;
  headline?: string | null;
  avatarUrl?: string | null;
}

export interface RoleDto {
  id: number;
  name: string;
}

export interface TechnologyDto {
  id: number;
  name: string;
}

export interface TypeDto {
  id: UUID;
  name: string;
}

export interface MemberRequestDto {
  userId: UUID;
  roleIds?: number[];
  status: MemberStatus;
}

export interface MemberDto {
  id: UUID;
  projectId?: UUID;
  user: UserDto;
  roles?: RoleDto[];
  status: MemberStatus;
  joinedAt: ISODateTimeString;
  leftAt?: ISODateTimeString | null;
}

export interface ProjectListItemDto {
  id: UUID;
  name: string;
  shortDescription?: string | null;
  status: ProjectStatus;
  type?: TypeDto | null;
  typeName?: TypeDto | null;
  owner: UserDto;
  technologies?: TechnologyDto[];
  technologyNames?: TechnologyDto[];
  roles?: RoleDto[];
  roleNames?: RoleDto[];
  members?: UserDto[];
  createdAt: ISODateTimeString;
}

export interface ProjectDetailResponse {
  id: UUID;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  status: ProjectStatus;
  type?: TypeDto | null;
  owner: UserDto;
  technologies?: TechnologyDto[];
  roles?: RoleDto[];
  members?: MemberDto[];
  createdAt: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  typeId?: UUID | null;
  status: ProjectStatus;
  technologyIds?: number[];
  roleIds?: number[];
  members?: MemberRequestDto[];
}

export interface ListProjectResponse {
  projects: ProjectListItemDto[];
  total: number;
  page: number;
  size: number;
}
