"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Info, Loader2 } from "lucide-react";

const GENERATION_PHASES = [
  "Analyzing your requirements",
  "Designing layout structure",
  "Generating color palette",
  "Creating components",
  "Optimizing for responsiveness",
  "Finalizing your website",
] as const;

interface AiStepGenerateProps {
  onComplete: () => void;
  error?: string | null;
}

export default function AiStepGenerate({ onComplete, error }: AiStepGenerateProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (error) {
      return;
    }

    if (finished) {
      return;
    }

    if (activeIndex >= GENERATION_PHASES.length - 1) {
      const timer = window.setTimeout(() => {
        setFinished(true);
        onCompleteRef.current();
      }, 1000);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => current + 1);
    }, 950);

    return () => window.clearTimeout(timer);
  }, [activeIndex, error, finished]);

  return (
    <div className="ai-wizard__step ai-wizard__step--generate">
      {error ? (
        <p className="platform-form__error ai-wizard__error ai-wizard__generate-error">{error}</p>
      ) : (
        <>
          <ul className="ai-wizard__generate-list" aria-label="Generation progress">
            {GENERATION_PHASES.map((label, index) => {
              const isDone = finished || index < activeIndex;
              const isActive = !finished && index === activeIndex;

              return (
                <li
                  key={label}
                  className={
                    isDone
                      ? "ai-wizard__generate-item is-done"
                      : isActive
                        ? "ai-wizard__generate-item is-active"
                        : "ai-wizard__generate-item"
                  }
                >
                  <span className="ai-wizard__generate-item-icon" aria-hidden>
                    {isDone ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : isActive ? (
                      <Loader2 size={14} strokeWidth={2} className="ai-wizard__spin" />
                    ) : null}
                  </span>
                  <span className="ai-wizard__generate-item-label">{label}</span>
                </li>
              );
            })}
          </ul>

          <div className="ai-wizard__pro-tip" role="note">
            <span className="ai-wizard__pro-tip-icon" aria-hidden>
              <Info size={16} strokeWidth={2} />
            </span>
            <p>
              <strong>Pro tip:</strong> While we&apos;re generating your website, you&apos;ll be able to refine and
              customize it further in the next step.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
