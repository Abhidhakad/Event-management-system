import express from "express";

import { createEvent, deleteEvent, getEventDetail, getAllEvents, updateEvent,getAllEventsById } from "../controllers/eventController.js";
import { authorize, verifyJWT } from "../middlewares/authMiddleware.js";
import { verifyAdmin } from "../middlewares/adminMiddleware.js";


const eventRouter = express.Router();


// private routes 
eventRouter.get("/user/my", verifyJWT, getAllEventsById);
eventRouter.post("/",verifyJWT,authorize('organizer','admin'),createEvent);
eventRouter.put("/:id",verifyJWT,authorize('organizer','admin'),updateEvent);
eventRouter.delete("/:id",verifyJWT,authorize('organizer','admin'),deleteEvent);


//public routes
// eventRouter.get("/",getAllEvents);
eventRouter.get("/:id",getEventDetail);

export default eventRouter;