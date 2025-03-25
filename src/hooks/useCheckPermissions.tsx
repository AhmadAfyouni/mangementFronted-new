import { RootState } from "@/state/store";
import { useSelector } from "react-redux";

export function usePermissions(requiredPermissions: string[]): boolean {
  const permissions = useSelector(
    (state: RootState) => state.user.userInfo?.job.permissions || []
  );

  return requiredPermissions.some((permission) =>
    permissions.includes(permission)
  );
}

export function useRolePermissions(
  role: "admin" | "primary_user" | "secondary_user"
): boolean {
  const myRole = useSelector((state: RootState) => state.user.role);

  if (role == myRole) {
    return true;
  } else {
    return false;
  }
}
