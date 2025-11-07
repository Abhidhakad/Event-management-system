import express from "express";
import { verifyJWT }  from "../middlewares/authMiddleware.js";
import { createBooking } from "../controllers/bookingController.js";



const router = express.Router();


// router.get("/my",authorize, getMyBookings);

router.post("/", verifyJWT, createBooking);

// router.delete("/:id", requireAuth, cancelBooking);

export default router;