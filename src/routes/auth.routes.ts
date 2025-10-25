import { Router } from "express";
import { signInUser } from "../controllers/users.controller";

const router: Router = Router();

// ========== AUTH ROUTES (Public) ==========
// This route is open to everyone (no authentication required).

// Sign in a user
router.post("/", signInUser);

export default router;
