interface SwitchTabProps {
  tabs: Array<{ name: string; count: number }>;
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

const SwitchTab = ({ tabs, activeTab, onTabChange }: SwitchTabProps) => {
  return (
    <div className="flex gap-8">
      {tabs.map((tab) => (
        <div key={tab.name} className="flex flex-col items-center">
          <button
            onClick={() => onTabChange(tab.name)}
            className={`flex items-center gap-2 pb-2 transition-colors ${
              activeTab === tab.name
                ? "text-black font-semibold"
                : "text-gray-400"
            }`}
          >
            <span>{tab.name}</span>
            {tab.count > 0 && (
              <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm text-black">
                {tab.count}
              </span>
            )}
          </button>
          {/* Active indicator */}
          {activeTab === tab.name && (
            <div className="w-full h-0.5 bg-primary -mb-px"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SwitchTab;
