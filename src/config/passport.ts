import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { handleGoogle } from "../controllers/auth/googleAuth.controller";
import dotenv from 'dotenv';
import userModel from "../models/users.model";
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;


passport.serializeUser((user,done)=>{
    done(null,(user as any)._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try{
            console.log(profile);
            const username = profile.displayName;
            const email = profile.emails?.[0]?.value ?? null;
            if(!username) return done(new Error("Name is required!"));
            if(!email) return done(new Error("Email not provided by Google"));
    
            const user = await handleGoogle({username , email});
            done(null, user);
        }catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            done(err,false);
        }
    }
  )
);
