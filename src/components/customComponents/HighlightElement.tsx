import { IconType } from "react-icons/lib";

export const HighLightElement = ({
  Icon,
  title,
  text,
}: {
  Icon: IconType;
  title: string;
  text: string;
}) => {
  return (
    <li className="flex flex-col items-center gap-3  p-4 rounded-md shadow-lg bg-blux-700 flex-1 min-w-[260px]">
      <Icon className="w-12 h-12  text-orangex-300 " />
      <p className="font-semibold text-white text-center">{title}</p>
      <p className="text-white text-center">{text}</p>
    </li>
  );
};
