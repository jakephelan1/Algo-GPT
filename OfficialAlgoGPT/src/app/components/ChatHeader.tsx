import { FC } from "react";
import Image from "next/image";

const ChatHeader: FC = () => {
  return (
    <div className="w-full flex justify-center items-center text-zinc-800 py-2">
      <Image src="/algogptLogo.svg" alt="AlgoGPT Logo" width={23} height={23}/>
      <p className="text-lg font-semibold text-[#77A4A6] pl-1">AlgoGPT</p>
    </div>
  );
};

export default ChatHeader;