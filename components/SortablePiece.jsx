import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

export function SortablePiece({ id, src, size, isCorrect }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: size,
    height: size,
    cursor: "grab",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative ${isCorrect ? "opacity-50" : ""}`}
    >
      <img
        src={src}
        alt="puzzle piece"
        className="w-full h-full object-cover select-none"
        style={{
          border: isCorrect ? "3px solid #10B981" : "1px solid #E5E7EB",
          borderRadius: "4px",
        }}
      />
      {isCorrect && (
        <div className="absolute inset-0 border-4 border-green-400 rounded pointer-events-none" />
      )}
    </div>
  );
}
