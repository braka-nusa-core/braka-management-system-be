import mongoose, { Document, Schema } from "mongoose";
import crypto from "crypto";
import type { ProjectStatus, MilestoneInput } from "./progress.types";

export interface IProgress extends Document {
    _id: mongoose.Types.ObjectId;
    client: mongoose.Types.ObjectId;
    projectName: string;
    status: ProjectStatus;
    progress: number;
    description?: string;
    milestones: MilestoneInput[];
    publicToken: string;
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}

function generatePublicToken(): string {
    return "brk_pg_" + crypto.randomBytes(10).toString("hex");
}

const milestoneSchema = new Schema<MilestoneInput>(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        completed: { type: Boolean, default: false },
    },
    { _id: false }
);

const progressSchema = new Schema<IProgress>(
    {
        client: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: [true, "Client reference is required"],
        },
        projectName: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            maxlength: [200, "Project name cannot exceed 200 characters"],
        },
        status: {
            type: String,
            enum: ["planning", "design", "development", "revision", "testing", "completed"],
            default: "planning",
        },
        progress: {
            type: Number,
            default: 0,
            min: [0, "Progress cannot be less than 0"],
            max: [100, "Progress cannot exceed 100"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },
        milestones: {
            type: [milestoneSchema],
            default: [],
        },
        publicToken: {
            type: String,
            unique: true,
        },
        lastUpdated: {
            type: Date,
            default: () => new Date(),
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Auto-generate publicToken on create only
progressSchema.pre("save", function (next) {
    if (this.isNew && !this.publicToken) {
        this.publicToken = generatePublicToken();
    }
    next();
});

// Sync lastUpdated on every save
progressSchema.pre("save", function (next) {
    this.lastUpdated = new Date();
    next();
});

// Indexes
progressSchema.index({ client: 1 });
progressSchema.index({ status: 1 });
progressSchema.index({ publicToken: 1 });

export const Progress = mongoose.model<IProgress>("Progress", progressSchema);
export { generatePublicToken };