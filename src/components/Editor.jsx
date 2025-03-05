"use client";
import React, { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { store } from "@/util/localstorage";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const DocsEditor = ({ activeDoc, setActiveDoc }) => {
  const docsId = activeDoc?._id;
  const userId = store().getItem("userData")?._id;
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (!quill || !docsId) return;

    // Join the new workspace
    socket.emit("join-workspace", docsId);

    // Remove previous event listeners before setting new ones
    socket.off("receive-changes");

    // Load document content
    quill.setContents(activeDoc?.content || []);

    // Debounced function to emit changes
    const emitChanges = debounce((data) => {
      socket.emit("send-changes", data);
      setActiveDoc((prev) => ({ ...prev, content: data.fullDelta }));
    }, 300);

    // Listen for text changes
    const handleTextChange = (delta, oldDelta, source) => {
      if (source === "user") {
        const fullDelta = quill.getContents();
        const data = { userId, delta, docsId, fullDelta };
        emitChanges(data);
      }
    };

    quill.on("text-change", handleTextChange);

    // Listen for incoming changes
    const handleReceiveChanges = (delta) => {
      quill.setContents(delta);

      quill.setSelection(quill.getLength());
    };

    socket.on("receive-changes", handleReceiveChanges);

    // Cleanup when component unmounts or docsId changes
    return () => {
      quill.off("text-change", handleTextChange);
      socket.off("receive-changes", handleReceiveChanges);
    };
  }, [quill, docsId]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={quillRef} />
    </div>
  );
};

export default DocsEditor;
