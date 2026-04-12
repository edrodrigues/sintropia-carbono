'use client';

interface StepIndicatorProps {
    currentStep: number;
    labels: string[];
}

export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-3">
                {labels.map((label, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;

                    return (
                        <div key={index} className="flex items-center flex-1 last:flex-initial">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                        isCompleted
                                            ? 'bg-[#1e40af] text-white shadow-md shadow-blue-500/30'
                                            : isCurrent
                                            ? 'bg-[#1e40af] text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-100'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <span className={`text-xs font-semibold hidden sm:block ${
                                    isCurrent ? 'text-[#1e40af] dark:text-blue-400' : isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                    {label}
                                </span>
                            </div>
                            {index < labels.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-300 ${
                                    isCompleted ? 'bg-[#1e40af]' : 'bg-gray-200 dark:bg-gray-700'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}