import { Router } from "express";
import { handleRefreshToken } from "../controllers/auth/refreshTokens.controller";

const router: Router = Router();

// ========== REFRESH TOKEN ROUTES (Public) ==========
// Issues a new access token using a valid refresh token.

router.post("/", handleRefreshToken);

export default router;
