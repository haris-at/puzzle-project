"use client";

import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";

export const PuzzlePiece = ({ id, src, size, isCorrect, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: size,
    height: size,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative group ${isCorrect ? "cursor-auto" : ""}`}
    >
      <div className="absolute inset-0 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-active:scale-95">
        <img
          src={src}
          alt="puzzle piece"
          className="w-full h-full object-cover select-none bg-gray-100"
          style={{
            border: isCorrect ? "3px solid #22c55e" : "2px solid #e5e7eb",
          }}
        />
        {isCorrect && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};
