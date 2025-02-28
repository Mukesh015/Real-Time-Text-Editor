"use client";

import { createDocument, getDocument } from "@/lib/api/docs";
import React, { useState, useEffect, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { GoPlus } from "react-icons/go";
import { IoMdDocument } from "react-icons/io";

const Sidebar = ({ setActiveDoc }) => {
  const [createNewDocument, setCreateNewDocument] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);
  const userId = "67c14a4c41f7d1962d35b120";
  const handleOpenFile = (file, index) => {
    setActiveDoc(file);
    setSelectedFile(index);
  };
  useEffect(() => {
    getDocument(userId).then((data) => {
      console.log("data :>> ", data);
      setFiles(data.data);
    });
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setCreateNewDocument(false);
      }
    };

    if (createNewDocument) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [createNewDocument]);

  const handleCreateNewFile = async () => {
    if (newFileName.trim() !== "") {
      let formattedName = newFileName.trim();
      if (!formattedName.endsWith(".txt")) {
        formattedName += ".txt"; // Ensure the file has .txt extension
      }
      console.log("formattedName :>> ", formattedName);
      const response = await createDocument({
        docName: formattedName,
        userId,
      });
      console.log("response :>> ", response);
      setFiles([...files, formattedName]); // Add new file to state
      setNewFileName(""); // Reset input
      setCreateNewDocument(false); // Close input
    }
  };
  console.log("files :>> ", files);
  return (
    <aside className="h-screen z-5 w-80 fixed left-0 top-20 border-r border-gray-300 bg-gray-100">
      <ul className="flex flex-col w-full gap-4 p-4">
        <li className="font-semibold text-xl">Your Documents</li>
        <li className="border border-gray-400 p-2 rounded-md w-full flex flex-row items-center gap-2">
          <CiSearch fill="gray" size={25} />
          <input
            placeholder="Search file..."
            className="border outline-none border-none w-full bg-transparent"
            type="text"
          />
        </li>
        <li className="w-full">
          <button
            onClick={() => setCreateNewDocument(true)}
            className="bg-gray-200 text_and_icon_button_background w-full flex items-center gap-2 p-2 rounded-md"
          >
            <GoPlus fill="gray" size={25} />
            <span className="text-gray-600 font-semibold">New Document</span>
          </button>
        </li>
      </ul>
      <ul className="scrollbar-hide flex flex-col w-full gap-2 p-4 h-[30rem] overflow-y-auto ease-in-out transition-all duration-200">
        {createNewDocument && (
          <li
            ref={inputRef}
            className="flex justify-start gap-2 items-center bg-gray-50 p-3 shadow-md rounded-md border border-gray-300 cursor-pointer"
          >
            <input
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateNewFile()}
              type="text"
              placeholder="Enter file name..."
              className="w-full border outline-none border-none bg-transparent"
            />
          </li>
        )}
        {files.map((file, index) => (
          <li
            onClick={() => handleOpenFile(file, index)}
            key={index}
            className={`${
              selectedFile === index ? "active_file" : ""
            } flex justify-start gap-2 items-center bg-gray-50 p-3 shadow-md rounded-md border border-gray-300 cursor-pointer`}
          >
            <IoMdDocument fill="gray" size={25} />
            <span className="text-gray-500">{file.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;