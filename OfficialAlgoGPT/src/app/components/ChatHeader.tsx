import { FC, useContext } from "react";
import Image from "next/image";
import { MessagesContext } from "@/context/messages";

const ChatHeader: FC = () => {
  const { clearHistory } = useContext(MessagesContext);

  return (
    <div className="w-full flex justify-between items-center text-zinc-800 py-2">
      <div className="flex items-center">
        <Image src="/algogptLogo.svg" alt="AlgoGPT Logo" width={23} height={23}/>
        <p className="text-lg font-semibold text-[#77A4A6] pl-1">AlgoGPT</p>
      </div>
      <button
        onClick={clearHistory}
        className="px-4 py-2 text-sm text-[#77A4A6] border border-[#77A4A6] rounded-lg hover:bg-[#77A4A6] hover:text-white transition-colors"
      >
        Clear History
      </button>
    </div>
  );
};

export default ChatHeader;