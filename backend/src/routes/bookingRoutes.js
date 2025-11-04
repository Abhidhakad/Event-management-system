import express from "express";
import { authorize } from "../middlewares/authMiddleware";
import { getMyBookings,createBooking,cancelBooking } from "../controllers/bookingController";



const router = express.Router();


router.get("/my",authorize, getMyBookings);

router.post("/", requireAuth, createBooking);
router.delete("/:id", requireAuth, cancelBooking);

export default router;