import express from "express";
import { loginUser, logout, refreshAccessToken, registerUser, } from "../controllers/authController";
import { verifyJWT } from "../middlewares/authMiddleware";
const router = express.Router();


router.post("/register",registerUser);

router.post("/login", loginUser);

router.post("refresh-token",refreshAccessToken);

router.post("/logout", verifyJWT, logout);

// router.get("/profile", authMiddleware, getProfile);

// router.get("/admin", authMiddleware, isAdmin, (req, res) => {
//   res.status(200).json({ message: "Welcome Admin!" });
// });

export default router;