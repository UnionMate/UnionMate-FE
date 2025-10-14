const FormEditSidebar = () => {
  return (
    <div className="flex flex-col p-6 h-full bg-white">
      <div className="flex flex-col gap-3">
        <div className="flex text-title-18-semibold text-black-100">
          질문 리스트
        </div>
        <div className="flex text-14-medium text-black-60 truncate">
          드래그를 통해 순서를 변경할 수 있어요
        </div>
      </div>

      {/* 질문 리스트를 넣어야 함 이때 질문 리스트는 드래그로 순서를 바꿀 수 있어야 함. */}
    </div>
  );
};

export default FormEditSidebar;
