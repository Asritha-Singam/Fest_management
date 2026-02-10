import express from "express"
import { connectDB } from "./config/db.js"


connectDB();

const app = express();

app.listen(4001, () => {
    console.log("Server started on PORT 4001!");
});

app.get("/api/organizers", (req, res) => {
    res.status(200).send("Organizers hello");
});

// app.put();
// app.post();
// app.delete();
