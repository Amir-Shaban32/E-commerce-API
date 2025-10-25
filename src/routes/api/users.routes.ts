import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication";
import { verifyRoles } from "../../middlewares/verifyRoles";
import ROLES_LIST from "../../config/roles_list";
import { 
    getUsers, 
    getUser, 
    updateUser, 
    deleteUser 
} from "../../controllers/users.controller";

const router: Router = Router();

// ========== USER ROUTES (Protected - Auth Required) ==========
// All routes require authentication.

router.use(authenticationMiddleware);

// Get all users (Admin only)
router.get("/", verifyRoles(ROLES_LIST.admin), getUsers);

// Get a single user by ID (User or Admin)
router.get("/:id", getUser);

// Update the authenticated user's profile
router.patch("/update", updateUser);

// Delete a user by ID
router.delete("/:id", deleteUser);

export default router;
