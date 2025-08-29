import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = () => {
  return (
    <div className="flex items-center gap-4">
      <ChevronLeft className="w-5 h-5 text-primary cursor-pointer" />
      <div className="flex gap-3">
        <span className="text-black font-semibold">1</span>
        <span className="text-gray-400">2</span>
        <span className="text-gray-400">3</span>
        <span className="text-gray-400">4</span>
        <span className="text-gray-400">5</span>
      </div>
      <ChevronRight className="w-5 h-5 text-primary cursor-pointer" />
    </div>
  );
};

export default Pagination;
