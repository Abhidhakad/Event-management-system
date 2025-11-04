import Booking from "../models/booking.model.js";
import Event from "../models/event.model.js"; // assuming you have Event model
import { v4 as uuidv4 } from "uuid";


export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user?._id; 

        const bookings = await Booking.find({ user_id: userId })
            .populate("event_id", "title date location")
            .populate("user_id", "name email");

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
};


export const createBooking = async (req, res) => {
    try {
        const { event_id, seats = 1 } = req.body;
        const userId = req.user?._id;

        if (!event_id) {
            return res.status(400).json({ message: "Event ID is required" });
        }

     
        const event = await Event.findById(event_id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.status !== "approved") {
            return res.status(400).json({ message: "Event is not approved for booking" });
        }

        if (event.availableSeats < seats) {
            return res.status(400).json({ message: "Not enough seats available" });
        }

        const ticket_id = `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`;

        const booking = await Booking.create({
            user_id: userId,
            event_id,
            ticket_id,
            bookingDate: Date.now(),
        });

        event.availableSeats -= seats;
        await event.save();

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ success: false, message: "Failed to create booking" });
    }
};


export const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?._id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Forbidden: You can only cancel your own bookings" });
        }

        
        await Booking.findByIdAndDelete(bookingId);

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ success: false, message: "Failed to cancel booking" });
    }
};
