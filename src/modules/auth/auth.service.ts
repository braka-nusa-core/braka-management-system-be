import jwt from "jsonwebtoken";
import { Admin, IAdmin } from "./auth.model";
import { ApiError } from "../../utils/appError";
import { env } from "../../config/env";
import type { LoginInput, JwtPayload, AuthResponse } from "./auth.types";

function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
}

function formatUser(admin: IAdmin) {
    return {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
    };
}

export async function loginAdmin(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find admin and explicitly select password field
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const payload: JwtPayload = {
        id: admin._id.toString(),
        email: admin.email,
    };

    const token = signToken(payload);

    return {
        user: formatUser(admin),
        token,
    };
}

export async function getAdminById(id: string) {
    const admin = await Admin.findById(id);
    if (!admin) {
        throw ApiError.notFound("Admin not found");
    }
    return formatUser(admin);
}