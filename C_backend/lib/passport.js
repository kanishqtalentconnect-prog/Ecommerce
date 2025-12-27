// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Profile:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      console.log('Existing Google user found:', user.email);
      return done(null, user);
    }
    
    // Check if user exists with same email (link accounts)
    const email = profile.emails?.[0]?.value;
    if (email) {
      user = await User.findOne({ email });
      
      if (user) {
        console.log('Linking Google account to existing user:', user.email);
        // Link Google account to existing user
        user.googleId = profile.id;
        user.isEmailVerified = true;
        user.profilePicture = user.profilePicture || profile.photos?.[0]?.value;
        await user.save();
        return done(null, user);
      }
    }
    
    // Create new user with Google account
    console.log('Creating new Google user');
    user = await User.createGoogleUser(profile);
    console.log('New Google user created:', user.email);
    
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth Strategy Error:', error);
    return done(error, null);
  }
}));

// Serialize user for session (though we're using JWT, this is still needed)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;