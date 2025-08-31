const MailButton = () => {
  return (
    <div className="flex gap-1.5">
      <div className="flex justify-center items-center w-[111px] h-[26px] rounded-sm py-[5px] px-[20px] bg-primary">
        <div className="flex text-[13px] font-semibold text-white">
          메일 예약하기
        </div>
      </div>

      <div className="flex justify-center items-center w-[111px] h-[26px] rounded-sm py-[5px] px-[20px] bg-primary">
        <div className="flex text-[13px] font-semibold text-white">
          메일 전송하기
        </div>
      </div>
    </div>
  );
};

export default MailButton;
