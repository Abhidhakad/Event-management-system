import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event is required"],
            index: true,
        },

        ticketId: {
            type: String,
            required: true,
            unique: true,
        },

    },
    { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
