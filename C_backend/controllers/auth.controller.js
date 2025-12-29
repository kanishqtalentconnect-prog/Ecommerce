import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import passport from "../lib/passport.js";
const isProduction = process.env.NODE_ENV === "production";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  if (!redis) return;
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 days
};

const setCookies = (res, accessToken, refreshToken) => {
  // Set access token cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true, // Set to false for http localhost
    // sameSite: "None", // Better for local development
    secure: isProduction, //changed for hosting
    sameSite: isProduction ? "None" : "Lax", // Better for hosting
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: true, // Set to false for http localhost
    // sameSite: "None", // Better for local development
    secure: isProduction, //changed for hosting
    sameSite: isProduction ? "None" : "Lax", // Better for hosting
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Set a non-httpOnly debug cookie
  res.cookie("isLoggedIn", "true", {
    httpOnly: false,
    // secure: true, // Set to false for http localhost
    // sameSite: "None", // Better for local development
    secure: isProduction, //changed for hosting
    sameSite: isProduction ? "None" : "Lax", // Better for hosting
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
};
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  let role = req.body.role || "customer";
  
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role,
      isEmailVerified: false // Email verification can be added later
    });

    // Generate and store authentication tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    // Set cookies for authentication
    setCookies(res, accessToken, refreshToken);

    // Update last login
    await user.updateLastLogin();

    // Return success response
    res.status(201).json({
      message: "User created successfully",
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is a Google user trying to login with password
    if (user.isGoogleUser()) {
      return res.status(400).json({ 
        message: "This account uses Google Sign-In. Please use 'Continue with Google' to login." 
      });
    }

    if (await user.comparePassword(password)) {
      // Generate and store authentication tokens
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      
      // Set cookies for authentication
      setCookies(res, accessToken, refreshToken);

      // Update last login
      await user.updateLastLogin();

      // Return user data with success response
      res.json(user.getPublicProfile());
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    // Clear all authentication cookies
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("isLoggedIn", { path: "/" });
    
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set new access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    // Update the non-httpOnly debug cookie
    res.cookie("isLoggedIn", "true", {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    
    // Clear cookies if refresh fails
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("isLoggedIn", { path: "/" });
    
    res.status(401).json({ message: "Invalid refresh token", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Return the public profile
    res.json(req.user.getPublicProfile());
  } catch (error) {
    console.log("Error in getProfile controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkAuth = async (req, res) => {
  // Simple endpoint to check authentication status
  res.json({ 
    authenticated: true,
    userId: req.user._id,
    authMethod: req.user.authMethod
  });
};

// Google Authentication Controllers
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

export const googleCallback = async (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Google auth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_cancelled`);
    }
    
    try {
      // Generate and store authentication tokens
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      
      // Set cookies for authentication
      setCookies(res, accessToken, refreshToken);
      
      // Update last login
      await user.updateLastLogin();
      
      // Get redirect path from session or default
      const redirectPath = req.session?.redirectAfterLogin || '/';
      delete req.session?.redirectAfterLogin;
      
      // Redirect based on user role
      if (user.role === 'admin') {
        res.redirect(`${process.env.FRONTEND_URL}/admin`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL}${redirectPath}`);
      }
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  })(req, res, next);
};

// Link Google account to existing user
export const linkGoogleAccount = async (req, res) => {
  try {
    const { googleId, email } = req.body;
    const userId = req.user._id;
    
    // Check if Google ID is already linked to another account
    const existingGoogleUser = await User.findOne({ googleId });
    if (existingGoogleUser && existingGoogleUser._id.toString() !== userId.toString()) {
      return res.status(400).json({ 
        message: "This Google account is already linked to another user" 
      });
    }
    
    // Link Google account to current user
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        googleId,
        isEmailVerified: true // Google emails are verified
      },
      { new: true }
    );
    
    res.json({
      message: "Google account linked successfully",
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.log("Error linking Google account:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Unlink Google account
export const unlinkGoogleAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    // Check if user has a password (can't unlink if no password)
    if (!user.password) {
      return res.status(400).json({ 
        message: "Cannot unlink Google account. Please set a password first." 
      });
    }
    
    // Unlink Google account
    user.googleId = undefined;
    await user.save();
    
    res.json({
      message: "Google account unlinked successfully",
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.log("Error unlinking Google account:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};