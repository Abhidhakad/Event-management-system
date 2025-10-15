import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            maxlength: [150, "Title cannot exceed 150 characters"],
            minlength: [3, "Title must be at least 3 characters long"],
            index: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: [10, "Description must be at least 10 characters long"],
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            validate: {
                validator: function (value) {
                    return value > new Date();
                },
                message: "Event date must be in the future",
            },
        },

        category: {
            type: String,
            enum: ["Conference", "Workshop", "Concert", "Webinar", "Meetup", "Party", "Other"],
            default: "Other",
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        seats: {
            type: Number,
            required: [true, "Seats are required"],
            min: [1, "At least one seat is required"],
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Organizer is required"],
        },
    },
    { timestamps: true }
);


eventSchema.pre("save", function (next) {
    if (this.date < new Date()) {
        return next(new Error("Event date must be in the future"));
    }
    next();
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
