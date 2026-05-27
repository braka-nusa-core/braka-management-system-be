import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export interface IAdmin extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // never returned in queries by default
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Hash password before save
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (
    candidate: string
): Promise<boolean> {
    return bcrypt.compare(candidate, this.password as string);
};

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);