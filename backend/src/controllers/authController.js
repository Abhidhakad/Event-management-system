import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshTokens } from "../utils/token.js";
import cookieOptions from "../config/cookieOptions.js";
import { registerSchema, loginSchema } from "../validators/authValidation.js"




export const registerUser = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ errors });
        }

        const { name, email, password, role } = value;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "User already registered", success: false });
        }

        const user = await User.create({ name, email, password, role });
        if (!user) {
            return res.status(500).json({ error: "Internal server error", success: false });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                message: "User registered successfully.",
                success: true,
            });
    } catch (error) {
        console.error("Error in registerUser:", error.message);
        res.status(500).json({ error: "Internal server error", success: false });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const { email, password } = value;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                message: "User logged in successfully.",
                success: true,
            });
    } catch (error) {
        console.error("Error in loginUser:", error.message);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Unauthorized - No refresh token provided" });
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            return res.status(404).json({ message: "Invalid refresh token" });
        }

        if (user.refreshToken !== incomingRefreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json({
                accessToken,
                message: "Access token refreshed successfully.",
            });


    } catch (error) {
        console.error("Error in refreshAccessToken:", error.message);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
}


export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: '',
                },
            },
            { new: true }
        );

        return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json({ message: "Logged out successfully", success: true });
    }
    catch (error) {
        console.error("Error in logoutUser:", error.message);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
}
