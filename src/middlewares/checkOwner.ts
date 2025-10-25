import { Request } from "express";
import ROLES_LIST from "../config/roles_list";

export const checkOwnershipOrAdmin = (inst: any, req: Request) => {
    if(!inst) return false;

    const resourceId = inst.user_id || inst._id;
    return resourceId.toString() === req.id || req.role=== ROLES_LIST.admin;
};
  