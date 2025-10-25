import { Router } from "express";
import { registerUser } from "../controllers/users.controller";

const router: Router = Router();

// ========== REGISTER ROUTES (Public) ==========
// Handles new user registration.

router.post("/", registerUser);

export default router;
