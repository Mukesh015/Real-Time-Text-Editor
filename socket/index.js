const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectToDatabase = require("./mongodb");
const Docs = require("./model/docs");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let workspaces = {}; // Store documents per workspace

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-workspace", (workspaceId) => {
    socket.join(workspaceId);
    console.log(`User ${socket.id} joined workspace: ${workspaceId}`);

    // Send existing document content if available
    if (!workspaces[workspaceId]) workspaces[workspaceId] = "";
    socket.emit("load-document", workspaces[workspaceId]);
  });

  //
  socket.on("send-changes", async ({ delta, workspaceId }) => {
    console.log("{ documentId, userId, content }", delta);
    socket.to(workspaceId).emit("receive-changes", { delta });
    try {
      await Docs.findByIdAndUpdate("67bec464895b4e078cd8615e", {
        $set: { content: delta },
      });

      // socket.to(documentId).emit("receive-changes", delta);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  });
  connectToDatabase().then(() => {
    console.log("📡 MongoDB Change Stream Started");

    const changeStream = Docs.watch();
    changeStream.on("change", (change) => {
      if (change.operationType === "update") {
        const documentId = change.documentKey._id.toString();
        const updatedContent = change.updateDescription.updatedFields.content;

        console.log(`🔄 Document Updated: ${documentId}`);
        io.to(documentId).emit("receive-changes", updatedContent);
      }
    });
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
