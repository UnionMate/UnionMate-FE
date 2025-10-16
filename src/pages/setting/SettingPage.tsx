import ChangeClubNameContainer from "@/widget/setting/ui/ChangeClubNameContainer";
import SettingMain from "@/widget/setting/ui/SettingMain";

const SettingPage = () => {
  return (
    <div className="flex flex-col w-full h-full gap-4 overflow-y-auto">
      <ChangeClubNameContainer />
      <SettingMain />
    </div>
  );
};

export default SettingPage;
