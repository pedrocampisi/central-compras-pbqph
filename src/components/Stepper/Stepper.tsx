import styles from './Stepper.module.css';

export interface Step {
  label: string;
  detail?: string;
}

interface StepperProps {
  steps: Step[];
  current: number; // 0-indexed
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className={styles.stepper}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : '';
        return (
          <div key={i} className={[styles.step, state ? styles[state] : ''].join(' ')}>
            <div className={styles.num}>
              {i < current ? '✓' : i + 1}
            </div>
            <div>
              <strong>{step.label}</strong>
              {step.detail && <span>{step.detail}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
