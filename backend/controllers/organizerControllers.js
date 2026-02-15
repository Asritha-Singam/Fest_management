import User from "../models/User.js";

export const getOrganizerProfile = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id).select("-password");

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({
      success: true,
      organizer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

export const updateOrganizerProfile = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    const {
      name,
      category,
      description,
      contactEmail,
      contactNumber
    } = req.body;

    if (name) organizer.name = name;
    if (category) organizer.category = category;
    if (description) organizer.description = description;
    if (contactEmail) organizer.contactEmail = contactEmail;
    if (contactNumber) organizer.contactNumber = contactNumber;

    await organizer.save();

    res.status(200).json({
      success: true,
      organizer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};
