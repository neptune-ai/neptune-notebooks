// Libs
import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {CSSTransitionProps} from 'react-transition-group/CSSTransition';


// Module
import './FadeTransition.less';
type FadeTransitionProps = Omit<CSSTransitionProps, 'timeout'> & { timeout?: CSSTransitionProps['timeout'] };

export const FadeTransition: React.FC<FadeTransitionProps> = ({ timeout = 400, children, ...otherProps }) => {
  return (
    <CSSTransition timeout={timeout} classNames="neptune-fade-transition" {...otherProps}>
      {children}
    </CSSTransition>
  )
};
