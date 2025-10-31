import { useNavigate } from "react-router-dom";
import Button from "../../shared/components/Button";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/greeting");
  };

  return (
    <div className="flex flex-col w-full h-screen justify-center items-center">
      <div className="flex flex-col items-center space-y-12">
        {/* 로고와 브랜드명 */}
        <div className="flex gap-3 items-center">
          {/* 로고 아이콘 - 파란색 괄호 모양 */}
          <div className="w-8 h-8 bg-blue-500 rounded-l-full"></div>
          <div className="font-bold text-[70px] tracking-[0.09em] text-black-100">
            UnionMate
          </div>
        </div>

        {/* 슬로건 */}
        <div className="text-center">
          <div className="font-bold text-3xl tracking-wide text-black-100">
            당신이 찾던 동아리 모집 올인원 솔루션, UnionMate
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="mt-40 w-[329px]">
          <Button buttonText="무료로 시작하기" onClick={handleStartClick} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
