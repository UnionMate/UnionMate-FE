interface SwitchStateProps {
  steps: Array<{
    key: string;
    label: string;
  }>;
  activeStep: string;
  onStepChange: (stepKey: string) => void;
}

const SwitchState = ({ steps, activeStep, onStepChange }: SwitchStateProps) => {
  return (
    <div className="flex gap-6">
      {steps.map((step, index) => {
        const isActive = step.key === activeStep;
        return (
          <button
            type="button"
            key={step.key}
            onClick={() => onStepChange(step.key)}
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                isActive ? "bg-primary" : "bg-gray-400"
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`text-14-medium ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SwitchState;
