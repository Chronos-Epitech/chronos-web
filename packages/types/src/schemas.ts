import { z } from "zod";
import { Constants } from "./supabase-types";

export const UserId = z.string();
export const TeamId = z.uuid();

// Teams
export const Team = z.object({
  id: TeamId,
  manager_id: UserId,
  name: z.string(),
});
export const CreateTeamInput = z.object({
  name: z.string().min(1),
  managerId: UserId,
  memberIds: z.array(UserId).optional(),
});
export const UpdateTeamInput = z.object({
  id: TeamId,
  name: z.string(),
});

// Team Members
export const User = z.object({
  id: UserId,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  role: z.enum(Constants.public.Enums.role),
  avatarUrl: z.string().nullable(),
});

export const TeamMember = z.object({
  teamId: TeamId,
  userId: UserId,
  createdAt: z.string().optional(),
});

export const TeamMembersResponse = z.object({
  manager: User,
  users: z.array(User),
});

export const AddTeamMemberInput = z.object({
  team_id: TeamId,
  userId: UserId,
});
export const RemoveTeamMemberInput = z.object({
  team_id: TeamId,
  user_id: UserId,
});

// Users
export const CreateUserInput = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
  email: z.email(),
  role: z.enum(Constants.public.Enums.role),
});

export const UpdateUserInput = z.object({
  id: UserId,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(Constants.public.Enums.role).optional(),
});

// Invitations
export const SendInvitationInput = z.object({
  email: z.email(),
  role: z.enum(Constants.public.Enums.role),
});

// Schedules
export const ScheduleId = z.uuid();
export const ScheduleType = z.enum(Constants.public.Enums.schedule_type);

export const Schedule = z.object({
  id: ScheduleId,
  user_id: UserId,
  created_at: z.date(),
  type: ScheduleType,
});

export const CreateScheduleInput = z.object({
  user_id: UserId,
  type: ScheduleType,
  created_at: z.date().optional(),
});

export const UpdateScheduleInput = z.object({
  id: ScheduleId,
  type: ScheduleType.optional(),
  created_at: z.date().optional(),
});

export const CheckInInput = z.object({
  user_id: UserId.optional(), // Optional for self check-in
});

export const CheckOutInput = z.object({
  user_id: UserId.optional(), // Optional for self check-out
});
