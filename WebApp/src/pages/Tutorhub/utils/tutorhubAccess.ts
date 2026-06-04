import type { TutorhubRole, TutorhubUserProfile } from "../models/tutorhubUser.model";

export function hasTutorhubRole(
  profile: TutorhubUserProfile | null,
  roles: TutorhubRole[]
) {
  return Boolean(profile && roles.includes(profile.role));
}

export function needsTutorhubProfile(profile: TutorhubUserProfile | null) {
  return !profile || profile.profileStatus === "missing";
}