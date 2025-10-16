import express from "express";

import { createEvent, deleteEvent, getAllEvents, updateEvent } from "../controllers/eventController.js";
import { authorize, verifyJWT } from "../middlewares/authMiddleware.js";



const eventRouter = express.Router();

//public routes
eventRouter.get("/",getAllEvents);
// eventRouter.get("/:id", getEventById)


// private routes 
eventRouter.post("/",verifyJWT,authorize('organizer','admin'),createEvent);
eventRouter.put("/:id",verifyJWT,authorize('organizer','admin'),updateEvent);
eventRouter.delete("/:id",verifyJWT,authorize('organizer','admin'),deleteEvent);


export default eventRouter;