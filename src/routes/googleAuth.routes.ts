import { Router } from "express";
import passport from "passport";
import { handleCallback } from "../controllers/auth/googleAuth.controller";

const router :Router = Router();


router.get('/login' , passport.authenticate('google',{
    scope:['profile' , 'email']
}));
router.get('/callback',passport.authenticate('google'),handleCallback);


export default router;