/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useState } from "react";

import { SortablePiece } from "../components/SortablePiece";

export default function PuzzleGame() {
  const [pieces, setPieces] = useState([]);
  const [originalImage, setOriginalImage] = useState(null);
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [completed, setCompleted] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const calculateContainerSize = useCallback(() => {
    const maxWidth = Math.min(window.innerWidth - 40, 800);
    const maxHeight = Math.min(window.innerHeight * 0.6, 600);
    setContainerSize({ width: maxWidth, height: maxHeight });
  }, []);

  useEffect(() => {
    calculateContainerSize();
    window.addEventListener("resize", calculateContainerSize);
    return () => window.removeEventListener("resize", calculateContainerSize);
  }, [calculateContainerSize]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        setOriginalImage(img);
        generatePuzzlePieces(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const generatePuzzlePieces = (img) => {
    const pieceWidth = img.width / cols;
    const pieceHeight = img.height / rows;
    const newPieces = [];

    // Create offscreen canvas for better performance
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pieceCanvas = document.createElement("canvas");
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        const pieceCtx = pieceCanvas.getContext("2d");

        // Extract piece from original image
        pieceCtx.drawImage(
          canvas,
          col * pieceWidth,
          row * pieceHeight,
          pieceWidth,
          pieceHeight,
          0,
          0,
          pieceWidth,
          pieceHeight
        );

        newPieces.push({
          id: `${row}-${col}`,
          content: pieceCanvas.toDataURL(),
          correctPosition: { row, col },
          currentPosition: {
            row: Math.floor(Math.random() * rows),
            col: Math.floor(Math.random() * cols),
          },
        });
      }
    }

    // Shuffle pieces
    setPieces(newPieces.sort(() => Math.random() - 0.5));
    setCompleted(false);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = pieces.findIndex((p) => p.id === active.id);
    const newIndex = pieces.findIndex((p) => p.id === over.id);
    const updatedPieces = arrayMove(pieces, oldIndex, newIndex);

    setPieces(updatedPieces);
    checkCompletion(updatedPieces);
  };

  const checkCompletion = (currentPieces) => {
    const isComplete = currentPieces.every((piece, index) => {
      const correctIndex =
        piece.correctPosition.row * cols + piece.correctPosition.col;
      return index === correctIndex;
    });

    if (isComplete) setCompleted(true);
  };

  const pieceSize = containerSize.width / cols;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              Rows:
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value)))}
                className="w-16 px-2 py-1 border rounded"
              />
            </label>
            <label className="flex items-center gap-2">
              Columns:
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(Math.max(1, parseInt(e.target.value)))}
                className="w-16 px-2 py-1 border rounded"
              />
            </label>
          </div>
        </div>

        {originalImage && (
          <div className="relative bg-white rounded-lg shadow-lg p-4">
            <div
              className="grid gap-1 mx-auto bg-gray-50 rounded"
              style={{
                width: containerSize.width,
                height: containerSize.height,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={pieces} strategy={rectSortingStrategy}>
                  {pieces.map((piece) => (
                    <SortablePiece
                      key={piece.id}
                      id={piece.id}
                      src={piece.content}
                      size={pieceSize}
                      isCorrect={
                        piece.currentPosition.row ===
                          piece.correctPosition.row &&
                        piece.currentPosition.col === piece.correctPosition.col
                      }
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            {completed && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-4xl font-bold animate-bounce">
                  Puzzle Completed!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
