"use client";

import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import RightPanel from "./RightPanel";

const Chat = () => {
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showBoxes, setShowBoxes] = useState(false);
  const [slides, setSlides] = useState<string[]>([]); // ✅ Store slides

  const handleLeaveProblem = () => {
    setShowRightPanel(false);
    setShowBoxes(true);
  };

  return (
    <PanelGroup direction="horizontal">
      {/* Left Panel - Chat */}
      <Panel defaultSize={50} minSize={20} maxSize={80}>
        <div className="flex flex-col h-screen">
          <div className="w-full bg-white shadow-md p-4 border-b border-gray-300">
            <ChatHeader />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ChatMessages className="px-2 py-3" />
          </div>

          {showBoxes && (
            <div className="w-full bg-transparent p-4 flex justify-center gap-4">
              <div className="bg-transparent p-4 rounded w-60 text-center border-2 border-[#77A4A6] text-[#77A4A6]">suggest question 1</div>
              <div className="bg-transparent p-4 rounded w-60 text-center border-2 border-[#77A4A6] text-[#77A4A6]">suggest question 2</div>
              <div className="bg-transparent p-4 rounded w-60 text-center border-2 border-[#77A4A6] text-[#77A4A6]">suggest question 3</div>
            </div>
          )}

          <div className="w-full bg-white p-4 border-t border-gray-300">
            <ChatInput 
              onShowRightPanel={() => setShowRightPanel(true)} 
              setSlides={setSlides} // ✅ Pass slides setter
              disabled={showRightPanel} 
            />
          </div>
        </div>
      </Panel>

      {showRightPanel && <PanelResizeHandle className="w-2 bg-gray-300 cursor-col-resize" />}

      {showRightPanel && (
        <Panel defaultSize={50} minSize={20} maxSize={80}>
          <RightPanel 
            slides={slides}  // ✅ Pass slides
            onClose={() => setShowRightPanel(false)} 
            onLeaveProblem={handleLeaveProblem} 
          />
        </Panel>
      )}
    </PanelGroup>
  );
};

export default Chat;