import { Router } from "express";
import { handleLogout } from "../controllers/auth/logout.controller";

const router: Router = Router();

// ========== LOGOUT ROUTES (Public) ==========
// Handles user logout (clears refresh token/cookie).

router.post("/", handleLogout);

export default router;
