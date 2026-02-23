import Event from "../models/events.js";
import Participation from "../models/participation.js";
import Order from "../models/Order.js";
import {Parser} from "json2csv";
import {sendDiscordMessage} from "../utils/sendDiscord.js";
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
      // Send Discord notification for new event creation
    const populatedEvent = await Event.findById(newEvent._id).populate("organizer");
    await sendDiscordMessage(
      `New Event Created: **${newEvent.eventName}**
      by ${populatedEvent.organizer.firstName} ${populatedEvent.organizer.lastName}

      - Description: ${newEvent.eventDescription}
      - Type: ${newEvent.eventType}
      - Eligibility: ${newEvent.eligibility}
      - Registration Deadline: ${newEvent.registrationDeadline.toDateString()}
      - Event Dates: ${newEvent.eventStartDate.toDateString()} to ${newEvent.eventEndDate.toDateString()}
      - Registration Fee: $${newEvent.registrationFee}`
      );

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
    
    // Add actual registration count for each event
    const eventsWithCount = await Promise.all(events.map(async (event) => {
      const participants = await Participation.find({ event: event._id });
      const totalRegistrations = participants.length;
      
      // Convert to plain object and add registrationCount
      const eventObj = event.toObject();
      eventObj.registrationCount = totalRegistrations;
      
      return eventObj;
    }));
    
    res.status(200).json({
      success: true,
      count: eventsWithCount.length,
      events: eventsWithCount
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
    
    let totalRegistrations = 0;
    let totalRevenue = 0;

    if (event.eventType === "MERCHANDISE") {
      // For merchandise events, only count registrations with approved orders
      const approvedOrders = await Order.find({ 
        eventId: event._id,
        paymentStatus: "Approved"
      });
      totalRegistrations = approvedOrders.length;
      totalRevenue = approvedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    } else {
      // For regular events, count all participants as revenue
      const participants = await Participation.find({ event: event._id });
      totalRegistrations = participants.length;
      totalRevenue = participants.length * event.registrationFee;
    }

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

// Get dashboard-level analytics for all completed events
export const getDashboardAnalytics = async (req, res) => {
  try {
    const organizerId = req.user.id;
    
    // Get all completed events by this organizer
    const completedEvents = await Event.find({ 
      organizer: organizerId, 
      status: "completed" 
    });

    if (completedEvents.length === 0) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalCompletedEvents: 0,
          totalRegistrations: 0,
          totalRevenue: 0,
          totalAttendance: 0,
          eventBreakdown: []
        }
      });
    }

    const eventIds = completedEvents.map(e => e._id);
    
    // Get all participations for these events
    const participations = await Participation.find({
      event: { $in: eventIds }
    }).populate('event', 'eventName registrationFee eventType');

    // Calculate aggregate stats
    let totalRegistrations = 0;
    let totalRevenue = 0;
    let totalAttendance = 0;
    const eventBreakdown = [];

    for (const event of completedEvents) {
      const eventParticipations = participations.filter(
        p => p.event._id.toString() === event._id.toString()
      );
      
      const registrations = eventParticipations.length;
      const revenue = eventParticipations.filter(p => p.paymentStatus === "Paid")
        .reduce((sum) => sum + event.registrationFee, 0);
      const attendance = eventParticipations.filter(p => p.status === "Completed").length;

      totalRegistrations += registrations;
      totalRevenue += revenue;
      totalAttendance += attendance;

      eventBreakdown.push({
        eventId: event._id,
        eventName: event.eventName,
        eventType: event.eventType,
        registrations,
        revenue,
        attendance
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalCompletedEvents: completedEvents.length,
        totalRegistrations,
        totalRevenue,
        totalAttendance,
        eventBreakdown
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard analytics",
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

      // Close registrations - set deadline to now
      if (updates.closeRegistrations === true) {
        event.registrationDeadline = new Date();
      }
    }

    // ONGOING → can only be marked as completed
    else if (event.status === "ongoing") {

      if (updates.status === "completed") {
        event.status = "completed";
      } else {
        return res.status(400).json({
          message: "Ongoing events can only be marked as completed"
        });
      }
    }

    // COMPLETED → no edits
    else {
      return res.status(400).json({
        message: "Completed events cannot be edited"
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