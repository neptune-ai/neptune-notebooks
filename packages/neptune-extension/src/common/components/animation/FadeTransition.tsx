import React from "react";
import { Transition } from 'react-transition-group';
import {TransitionProps} from "react-transition-group/Transition";

type TransitionStyles = {
  [transition: string]: React.CSSProperties
}
const transitionStyles: TransitionStyles = {
  entering: { opacity: 0 },
  entered:  { opacity: 1 },
  exiting:  { opacity: 0 },
  exited:  { opacity: 0 },
};

type FadeTransitionProps = Omit<TransitionProps, 'timeout'> & { timeout?: TransitionProps['timeout'] };

export const FadeTransition: React.FC<FadeTransitionProps> = ({ timeout = 300, children, ...otherProps }) => {
  const defaultStyle = {
    transition: `opacity ${timeout}ms`,
    opacity: 0,
  };

  return (
    <Transition timeout={timeout} {...otherProps}>
      {state => (
        <div style={{
          ...defaultStyle,
          ...transitionStyles[state]
        }}>
          {children}
        </div>
      )}
    </Transition>
  )
};
