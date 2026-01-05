import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model';
import { env } from './env';
import { Logger } from './logger';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) {
            return done(new Error('No email found from Google profile'), undefined);
          }

          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if user exists with email but different/no googleId
            user = await User.findOne({ email });

            if (user) {
              // Update existing user with googleId
              user.googleId = profile.id;
              if (!user.avatarUrl) user.avatarUrl = profile.photos?.[0].value;
              await user.save();
            } else {
              // Create new user
              user = await User.create({
                googleId: profile.id,
                email,
                name: profile.displayName,
                avatarUrl: profile.photos?.[0].value,
              });
            }
          }

          return done(null, user);
        } catch (error) {
          Logger.error('Google Auth Error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );


};
