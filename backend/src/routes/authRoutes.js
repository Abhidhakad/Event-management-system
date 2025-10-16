import express from "express";
import { loginUser, logout, refreshAccessToken, registerUser, } from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();


authRouter.post("/register",registerUser);

authRouter.post("/login", loginUser);

// authRouter.post("/refresh-token",refreshAccessToken);

authRouter.post("/logout", verifyJWT, logout);

// // authRouter.get("/profile", authMiddleware, getProfile);

// // authRouter.get("/admin", authMiddleware, isAdmin, (req, res) => {
// //   res.status(200).json({ message: "Welcome Admin!" });
// // });

export default authRouter;

