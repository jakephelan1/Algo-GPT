"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import ChatInput from "./ChatInput";

interface RightPanelProps {
  slides: string[];
  onClose: () => void;
  onLeaveProblem: () => void;
  onClearSlides?: () => Promise<void>;
}

const RightPanel: React.FC<RightPanelProps> = ({ slides, onClose, onLeaveProblem, onClearSlides }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideContext, setSlideContext] = useState<string | null>(null);
  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [allSlidesGenerated, setAllSlidesGenerated] = useState(false);

  // ✅ Detect when all slides have been generated dynamically (Length-Based)
  useEffect(() => {
    if (slides.length > 0 && currentSlideIndex === slides.length - 1) {
      setAllSlidesGenerated(true);
    }
  }, [slides, currentSlideIndex]);

  // ✅ Auto-update to the latest slide as they generate
  useEffect(() => {
    if (slides.length > 0 && !allSlidesGenerated) {
      setCurrentSlideIndex(slides.length - 1);
    }
  }, [slides, allSlidesGenerated]);

  // ✅ Handle slide selection dynamically
  const handleSlideClick = (index: number) => {
    if (allSlidesGenerated) {
      setCurrentSlideIndex(index);
      setSlideContext(slides[index]);
      setIsChatEnabled(true);
    }
  };

  return (
    <div className="bg-gray-100 border-l flex flex-col h-screen">
      {/* Close Panel Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={async () => {
            if (onClearSlides) {
              await onClearSlides();
            } else {
              onClose();
            }
          }}
          className="hover:bg-gray-200 rounded-full p-1"
        >
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={index}
              className={`p-4 cursor-pointer border-b transition ${
                currentSlideIndex === index ? "bg-blue-200 border-l-4 border-blue-600" : "hover:bg-gray-200"
              } ${allSlidesGenerated ? "cursor-pointer" : "pointer-events-none opacity-50"}`} // ✅ Unlock selection when all slides are ready
              onClick={() => handleSlideClick(index)}
              dangerouslySetInnerHTML={{ __html: slide }}
            />
          ))
        ) : (
          <p className="p-4 text-gray-500">Generating Visualization...</p>
        )}
      </div>

      {isChatEnabled && slideContext && (
        <div className="border-t bg-white p-4">
          <p className="text-sm text-gray-500 mb-2">Chat using selected slide context</p>
          <ChatInput slideContext={slideContext} onShowRightPanel={() => {}} setSlides={() => {}} />
        </div>
      )}

      {allSlidesGenerated && slides.length > 1 && (
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
      )}
    </div>
  );
};

export default RightPanel;
