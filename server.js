
const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Import the uuid library

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const dbPath = path.join(__dirname, "db", "db.json");
let notes = [];

try {
  // Synchronously read a file
  const data = fs.readFileSync(dbPath, "utf8");
  notes = JSON.parse(data);
} catch (err) {
  console.log("Error reading db.json:", err);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.get("*", (req, res) => {
  res.status(404).send("404 Page Not Found");
});

app.post("/api/notes", (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4(); // Use uuid to generate a unique ID for the note
  notes.push(newNote);

  fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (err) => {
    if (err) {
      console.error("Error writing to db.json:", err);
      return res.status(500).send("Error saving the note.");
    }
    res.json(newNote);
  });
});
app.delete("/api/notes/:note_id", (req, res) => {
  const noteId = req.params.note_id; // No need to parse, keep it as a string
  notes = notes.filter((note) => note.id !== noteId);

  fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (err) => {
    if (err) {
      console.error("Error writing to db.json:", err);
      return res.status(500).send("Error deleting the note.");
    }
    res.json({ message: "Note deleted" });
  });
});


app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});


