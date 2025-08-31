const SwitchState = () => {
  return (
    <div className="flex gap-6">
      <div className="flex gap-2.5">
        <div className="flex w-5 h-5 rounded-full justify-center items-center text-[10px] font-bold text-white bg-gray-400">
          1
        </div>
        <div className="flex text-14-medium text-gray-500">지원자 평가</div>
      </div>

      <div className="flex gap-2.5">
        <div className="flex w-5 h-5 rounded-full justify-center items-center text-[10px] font-bold text-white bg-gray-400">
          2
        </div>
        <div className="flex text-14-medium text-gray-500">합-불 메일 전송</div>
      </div>

      <div className="flex gap-2.5">
        <div className="flex w-5 h-5 rounded-full justify-center items-center text-[10px] font-bold text-white bg-gray-400">
          3
        </div>
        <div className="flex text-14-medium text-gray-500">합격자 이동</div>
      </div>
    </div>
  );
};

export default SwitchState;
