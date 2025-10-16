import Event from "../models/eventModel.js";
import { eventValidationSchema, updateEventValidationSchema } from "../validators/eventValidation.js";


export const createEvent = async (req, res) => {
    try {
        const { error, value } = eventValidationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ success: false, errors });
        }

        const { title, description, date, location, totalSeats } = value;
        const user = req.user;
        if (user.role !== "admin" && user.role !== "organizer") {
            return res.status(403).json({ success: false, message: "Unauthorized -you can not create events" });
        }


        const event = await Event.create({
            title,
            description,
            date,
            location,
            totalSeats,
            seatsAvailable: totalSeats,
            organizer: user._id,
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            event,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const getAllEvents = async (req, res) => {
  try {

    const events = await Event.find()
      .select("-__v")
      .populate("organizer","name")
      .sort({ date: 1 })
      .lean();

    if (!events || events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No events available at the moment",
        events: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const getAllEventsById = async (req, res) => {
    try {
        const organizerId = req.user?._id;
        if (!organizerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const events = await Event.find({ organizer: organizerId }).select("-__v").sort({ createdAt: -1 }).lean();


        if (!events || events.length === 0) {
            return res.status(404).json({ success: false, message: "No events created yet" });
        }
        return res.status(200).json({
            success: true,
            message: "Events successfully fetched",
            events,
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const updateEvent = async (req, res) => {
    try {
        const organizerId = req.user?._id;
        const eventId = req.params?.id

        if (!eventId) {
            return res.status(400).json({ success: false, message: "Event ID is required" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (req.user.role !== "admin" && event.organizer.toString() !== organizerId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized: Access denied" });
        }


        const { error, value } = updateEventValidationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ success: false, errors });
        }

        const { title, description, date, location, totalSeats } = value;

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;

        if (totalSeats) {
            if (totalSeats < event.totalSeats - event.seatsAvailable) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot reduce total seats below already booked seats",
                });
            }
            const bookedSeats = event.totalSeats - event.seatsAvailable;
            event.totalSeats = totalSeats;
            event.seatsAvailable = totalSeats - bookedSeats;
        }

        const updatedEvent = await event.save();

        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event: updatedEvent,
        });

    } catch (error) {
        console.error("Error updating event:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}



export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params?.id;
        const organizerId = req.user?._id;

        if (!eventId) {
            return res.status(400).json({ success: false, message: "Event ID is required" });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (req.user.role !== "admin" && event.organizer.toString() !== organizerId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized: Access denied" });
        }

        await Event.findByIdAndDelete(eventId);

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting event:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}