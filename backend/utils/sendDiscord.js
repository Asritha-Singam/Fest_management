import axios from "axios";

export const sendDiscordMessage = async (content) => {
  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: content
    });
  } catch (error) {
    console.error("Discord webhook error:", error);
  }
};
