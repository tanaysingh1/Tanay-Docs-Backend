const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 8080;
const folderPath = path.join(__dirname, "files");

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.use(cors());

// Ensure the folder exists
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}

app.post("/save-file", (req, res) => {
  const { fileName, text } = req.body;
  if (!fileName || !text) {
    return res.status(400).json("Need a file name and contents");
  }
  const filePath = path.join(folderPath, `${fileName}.txt`);

  fs.writeFile(filePath, text, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to write file" });
    }

    // Read all files in the folder
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        return res.status(500).json({ error: "Failed to read files" });
      }

      const fileContents = files.map((file) => {
        const content = fs.readFileSync(path.join(folderPath, file), "utf-8");
        return { fileName: file, content };
      });

      res.json(fileContents);
    });
  });
});
app.get("/files", (req, res) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read files" });
    }
    res.json(files);
  });
});

app.get("/files/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(folderPath, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const content = fs.readFileSync(filePath, "utf-8");
  res.json({ fileName, content });
});
app.post("/update-file", (req, res) => {
  const { fileName, text } = req.body;
  const filePath = path.join(folderPath, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.writeFile(filePath, text, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to update file" });
    }

    res.json({ message: "File updated successfully" });
  });
});
app.delete("/files/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(folderPath, fileName);
  console.log(filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete file" });
    }
    res.json({ message: "File deleted successfully" });
  });
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
