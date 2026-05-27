import mongoose, { Document, Schema } from "mongoose";
import type { ClientStatus } from "./client.types";

export interface IClient extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    picName: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
    status: ClientStatus;
    createdAt: Date;
    updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
    {
        name: {
            type: String,
            required: [true, "Client name is required"],
            trim: true,
            maxlength: [150, "Name cannot exceed 150 characters"],
        },
        picName: {
            type: String,
            required: [true, "PIC name is required"],
            trim: true,
            maxlength: [100, "PIC name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            trim: true,
            maxlength: [20, "Phone cannot exceed 20 characters"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            maxlength: [300, "Address cannot exceed 300 characters"],
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "Notes cannot exceed 1000 characters"],
        },
        status: {
            type: String,
            enum: ["active", "inactive", "prospect"],
            default: "active",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ name: "text", picName: "text", email: "text" });

export const Client = mongoose.model<IClient>("Client", clientSchema);