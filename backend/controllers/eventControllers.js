import Event from "../models/events.js";

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

    let query = { status: "published" };

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
    }

    let events = await Event.find(query)
      .populate("organizer", "firstName lastName");

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
