import mongoose, { Document, Schema } from "mongoose";
import type { NotificationType } from "./notification.types";

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    relatedClient?: mongoose.Types.ObjectId;
    relatedInvoice?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            maxlength: [1000, "Message cannot exceed 1000 characters"],
        },
        type: {
            type: String,
            enum: ["due_soon", "overdue", "payment_received", "system"],
            default: "system",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedClient: {
            type: Schema.Types.ObjectId,
            ref: "Client",
        },
        relatedInvoice: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ relatedClient: 1 });
notificationSchema.index({ relatedInvoice: 1 });

export const Notification = mongoose.model<INotification>(
    "Notification",
    notificationSchema
);