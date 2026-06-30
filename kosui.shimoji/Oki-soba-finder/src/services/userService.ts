import {
  updateUserRole,
  findAllUsers,
} from "../repositories/userRepository.js";
import type { UserListRow } from "../repositories/userRepository.js";

export async function changeUserRole(
  id: number,
  role: string,
): Promise<boolean> {
  const affected = await updateUserRole(id, role);
  return affected > 0;
}

export async function listUsers(): Promise<UserListRow[]> {
  return findAllUsers();
}
