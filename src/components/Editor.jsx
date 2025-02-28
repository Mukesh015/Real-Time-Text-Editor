"use client";

import React, { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
const DocsEditor = ({ activeDoc }) => {

  const docsId = activeDoc?._id;

  
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (!docsId) return;

    socket.emit("join-workspace", docsId);

    if (quill) {
      if (activeDoc?.content) {
        quill.updateContents(activeDoc?.content);
      }

      // Listen for changes from other users
      quill.on("text-change", (delta, oldDelta, source) => {
        const fullDelta = quill?.getContents(); 
        
        const data = {
          userId: "67c14a4c41f7d1962d35b120",
          delta,
          docsId,
          fullDelta
        };
        console.log("data :>> ", data);
        if (source === "user") {
          socket.emit("send-changes", data);
        }
      });

      // Apply received changes
      socket.on("receive-changes", (data) => {
        console.log("delta", data);
        // quill.updateContents(delta);
      });
    }

    return () => {
      socket.off("receive-changes");
    };
  }, [quill, docsId]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={quillRef} />
    </div>
  );
};

export default DocsEditor;
