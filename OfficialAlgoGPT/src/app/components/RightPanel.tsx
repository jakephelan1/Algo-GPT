"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface RightPanelProps {
  slides: string[];
  onClose: () => void;
  onLeaveProblem: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ slides, onClose, onLeaveProblem }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // ✅ Auto-update to the latest slide when slides update
  useEffect(() => {
    if (slides.length > 0) {
      setCurrentSlideIndex(slides.length - 1); // ✅ Move to last slide received
    }
  }, [slides]); // ✅ Listen to full slides array instead of just length

  return (
    <div className="bg-gray-100 border-l flex flex-col h-screen">
      <button onClick={onClose}><X size={20} /></button>

      {slides.length > 0 ? (
        <div dangerouslySetInnerHTML={{ __html: slides[currentSlideIndex] }} />
      ) : (
        <p className="p-4 text-gray-500">Generating Visualization...</p>
      )}

      <div className="flex justify-between p-4">
        <button
          onClick={() => setCurrentSlideIndex((i) => Math.max(i - 1, 0))}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentSlideIndex((i) => Math.min(i + 1, slides.length - 1))}
          disabled={currentSlideIndex >= slides.length - 1}
          className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
