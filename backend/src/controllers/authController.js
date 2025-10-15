import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import joi from "joi";
import bcrypt from "bcrypt";


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

const generateAccessAndRefereshTokens = async (userid) => {
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new Error("Failed to generate token: ", error);
    }
}


const registerSchema = joi.object({
    name: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string()
        .min(6)
        .max(128)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
        .required()
        .messages({
            "string.pattern.base":
                "Password must include uppercase, lowercase, number, and special character",
        }),
    role: joi.string().valid("user", "admin", "organizer").default("user"),
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});


// register new user

export const registerUser = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ errors });
        }
        const { name, email, password } = value;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "User already registered" });
        }
        const user = await User.create({ name, email, password: hashedPassword, role });

        if (!user) { return res.status(500).json({ error: "Internal server error" }) }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    accessToken,
                },
                message: "User registered successfully."
            })

    }
    catch (error) {
        console.log(error);
    }
}



export const loginUser = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: "Invalid credentials" });

        const { email, password } = value;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    accessToken,
                },
                message: "User loggedIn successfully."
            })



    } catch (error) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
