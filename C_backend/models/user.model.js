import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            // Password is only required if user doesn't have a Google ID
            return !this.googleId;
        },
        minlength: [6, "Password must be at least 6 characters long"]
    },
    role: {
        type: String,
        enum: ["customer", "seller", "admin"],
        default: "customer"
    },
    // Google OAuth fields
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows null values while maintaining uniqueness for non-null values
    },
    isEmailVerified: {
        type: Boolean,
        default: function() {
            // Google users have pre-verified emails
            return !!this.googleId;
        }
    },
    // Profile information
    profilePicture: {
        type: String,
        default: null
    },
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ]
    //createdAt, UpdatedAt
}, {
    timestamps: true
});

// REMOVED DUPLICATE INDEXES - The unique: true in field definitions already creates them
// userSchema.index({ email: 1 }); // REMOVED - email already has unique: true
// userSchema.index({ googleId: 1 }); // REMOVED - googleId already has unique: true, sparse: true

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
    // Only hash password if it's modified and exists
    if (!this.isModified("password") || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
    // Return false if user doesn't have a password (Google user)
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
};

// Method to check if user is a Google user
userSchema.methods.isGoogleUser = function() {
    return !!this.googleId;
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Method to get user profile (excluding sensitive data)
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.googleId;
    return userObject;
};

// Static method to find user by email or Google ID
userSchema.statics.findByEmailOrGoogleId = function(email, googleId) {
    const query = { $or: [] };
    
    if (email) query.$or.push({ email });
    if (googleId) query.$or.push({ googleId });
    
    return this.findOne(query);
};

// Static method to create Google user
userSchema.statics.createGoogleUser = function(profile) {
    return this.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos?.[0]?.value,
        role: 'customer',
        isEmailVerified: true
    });
};

// Virtual for user's full profile with authentication method
userSchema.virtual('authMethod').get(function() {
    return this.googleId ? 'google' : 'email';
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.password;
        delete ret.googleId;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model("User", userSchema);

export default User;