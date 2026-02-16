import Event from "../models/events.js";
import Participation from "../models/participation.js";
import {Parser} from "json2csv";

// Helper function to update event status to "ongoing" if date falls between start and end
const updateEventStatusIfOngoing = async (event) => {
  const now = new Date();
  const startDate = new Date(event.eventStartDate);
  const endDate = new Date(event.eventEndDate);
  
  // If event is published and current time is between start and end, mark as ongoing
  if (event.status === "published" && now >= startDate && now <= endDate) {
    event.status = "ongoing";
    await event.save();
  }
  
  return event;
};

export const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventDescription,
      eventType,
      eligibility,
      registrationDeadline,
      eventStartDate,
      eventEndDate,
      registrationLimit,
      registrationFee,
      eventTags,
      merchandiseDetails,
      customFormFields
    } = req.body;

    // Check if event with same name already exists for this organizer
    const existingEvent = await Event.findOne({
      eventName,
      organizer: req.user.id
    });

    if (existingEvent) {
      return res.status(400).json({
        success: false,
        message: "You already have an event with this name. Please use a different name."
      });
    }

    const newEvent = new Event({
      eventName,
      eventDescription,
      eventType,
      eligibility,
      registrationDeadline,
      eventStartDate,
      eventEndDate,
      registrationLimit,
      registrationFee,
      eventTags,
      merchandiseDetails,
      customFormFields,
      organizer: req.user.id // comes from JWT middleware
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message
    });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const { search, type, eligibility, startDate, endDate } = req.query;

    let query = { status: { $in: ["published", "ongoing"] } };

    // Filter by type
    if (type) {
      query.eventType = type;
    }

    // Filter by eligibility
    if (eligibility) {
      query.eligibility = eligibility;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.eventStartDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.eventStartDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.eventStartDate = { $lte: new Date(endDate) };
    }

    let events = await Event.find(query)
      .populate("organizer", "firstName lastName");

    // Update status to ongoing if current date falls between start and end dates
    events = await Promise.all(events.map(event => updateEventStatusIfOngoing(event)));

    // Search by event name (partial match)
    if (search) {
        const regex = new RegExp(search, "i");

        events = events.filter(event =>
            regex.test(event.eventName) ||
            regex.test(event.organizer.firstName) ||
            regex.test(event.organizer.lastName)
        );
    }
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message
    });
  }
};

export const getOrganizerEvents = async (req, res) => {
  try {
    let events = await Event.find({ organizer: req.user.id });
    
    // Update status to ongoing if current date falls between start and end dates
    events = await Promise.all(events.map(event => updateEventStatusIfOngoing(event)));
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching organizer events",
      error: error.message
    });
  }
};

export const getEventsByOrganizerId = async (req, res) => {
  try {
    const { organizerId } = req.params;

    let events = await Event.find({ 
      organizer: organizerId,
      status: { $in: ["published", "ongoing", "completed"] }
    }).populate("organizer", "firstName lastName");
    
    // Update status to ongoing if current date falls between start and end dates
    events = await Promise.all(events.map(event => updateEventStatusIfOngoing(event)));
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching organizer events",
      error: error.message
    });
  }
};

export const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (event.status !== "draft") {
      return res.status(400).json({ message: "Only draft events can be published" });
    }

    event.status = "published";
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event published successfully",
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error publishing event",
      error: error.message
    });
  }
};

export const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const participants = await Participation.find({ event: req.params.eventId })
      .populate("participant", "firstName lastName email");
    res.status(200).json({
      success: true,
      count: participants.length,
      participants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching participants",
      error: error.message
    });
  }
};

export const getEventAnalytics = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const participants = await Participation.find({ event: event._id });
    const totalRegistrations = participants.length;
    const totalRevenue = participants.filter(p=>p.paymentStatus === "Paid")
      .reduce((sum, p) => sum + event.registrationFee, 0);
    res.status(200).json({
      success: true,
      analytics: {
        totalRegistrations,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event analytics",
      error: error.message
    });
  }
};

export const exportParticipantsCSV = async (req, res) => {
  try {
    const participations = await Participation.find({ event: req.params.eventId }).populate("participant", "firstName lastName email");
    const data=participations.map(p => ({
      name: `${p.participant.firstName} ${p.participant.lastName}`,
      email: p.participant.email,
      registrationDate: p.registrationDate,
      paymentStatus: p.paymentStatus,
      status: p.status
    }));
    const parser=new Parser()
    const csv = parser.parse(data);
    res.header("Content-Type", "text/csv");
    res.attachment("participants.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting participants",
      error: error.message
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = req.body;

    // DRAFT → full edit allowed
    if (event.status === "draft") {
      Object.assign(event, updates);
    }

    // PUBLISHED → limited edits
    else if (event.status === "published") {

      if (updates.eventDescription)
        event.eventDescription = updates.eventDescription;

      if (updates.registrationDeadline)
        event.registrationDeadline = updates.registrationDeadline;

      if (updates.registrationLimit &&
          updates.registrationLimit > event.registrationLimit)
        event.registrationLimit = updates.registrationLimit;

      if (updates.status === "closed")
        event.status = "closed";
    }

    // ONGOING → only status change
    else if (event.status === "ongoing") {

      if (updates.status &&
          ["completed", "closed"].includes(updates.status)) {
        event.status = updates.status;
      } else {
        return res.status(400).json({
          message: "Ongoing events can only change status to completed or closed"
        });
      }
    }

    // COMPLETED or CLOSED → no edits
    else {
      return res.status(400).json({
        message: "Completed or closed events cannot be edited"
      });
    }

    await event.save();

    res.status(200).json({
      success: true,
      event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message
    });
  }
};

// Get Trending Events (Top 5 events by registrations in last 24 hours)
export const getTrendingEvents = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const trendingParticipations = await Participation.aggregate([
      {
        $match: {
          createdAt: { $gte: last24Hours }
        }
      },
      {
        $group: {
          _id: "$event",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const eventIds = trendingParticipations.map(p => p._id);
    
    const events = await Event.find({
      _id: { $in: eventIds },
      status: { $in: ["published", "ongoing"] }
    }).populate("organizer", "firstName lastName");

    // Sort by registration count
    const sortedEvents = events.map(event => {
      const participation = trendingParticipations.find(p => p._id.toString() === event._id.toString());
      return {
        ...event.toObject(),
        trendingScore: participation?.count || 0
      };
    }).sort((a, b) => b.trendingScore - a.trendingScore);

    res.status(200).json({
      success: true,
      count: sortedEvents.length,
      events: sortedEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching trending events",
      error: error.message
    });
  }
};
