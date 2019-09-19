// Libs
import React from 'react';
import {
  isArray,
  isPlainObject,
  isString,
} from 'lodash';

// App
import { LayoutUnit } from 'common/components/layout/types';
import { bemBlock } from 'common/utils/bem';

// Module
import './LayoutElement.less';

type OverflowBasicValue = 'auto' | 'visible' | 'hidden'
type OverflowValue = AxisValues<OverflowBasicValue> | OverflowBasicValue
type WithPaddingValue = boolean | LayoutUnit | Array<LayoutUnit | false | null> | AxisValues<LayoutUnit | false | null>
type SpanValue = 'greedy' | 'auto' | 'grow' | 'shrink' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'

interface AxisValues<T> {
  horizontal? : T
  vertical? : T
}

export interface LayoutElementProps extends React.HTMLAttributes<any> {
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  childSpacing?: true | false | LayoutUnit,
  className?: string,
  component?: string | React.FC<any> | React.ComponentClass<any>
  height?: number | string,
  overflow?: OverflowValue
  span?: SpanValue
  style?: React.CSSProperties,
  width?: number | string,
  withCustomScrollbar?: boolean,
  withGutter?: boolean | LayoutUnit
  withPadding?: WithPaddingValue
  elementRef?: () => void,
  ref?: () => void,
}

const block = bemBlock('n-layout-element');

const LayoutElement: React.FC<LayoutElementProps> = ({
  alignSelf,
  children,
  childSpacing,
  className,
  component = 'div',
  height,
  overflow,
  span = 'auto',
  style, // to be able to pass custom style
  width,
  withCustomScrollbar,
  withGutter = false,
  withPadding = false,
  elementRef,
  ...props
}) => {

  const isHeightSet = isSizeValueSet(height);
  const isWidthSet = isSizeValueSet(width);
  const isSizeSet = isHeightSet || isWidthSet;

  const ownProps: LayoutElementProps = {
    className: block({
      modifiers: [
        {
          span: isSizeSet ? 'auto' : span,
          withGutter,
          withCustomScrollbar,
          alignSelf,
          childSpacing,
        },
        getPaddingClasses(withPadding),
        getScrollClasses(overflow),
      ],
      extra: className,
    }),
    style: style || {},
  };

  if (elementRef) {
    ownProps.ref = elementRef;
  }

  if (isHeightSet && ownProps.style) {
    ownProps.style.height = height;
  }

  if (isWidthSet && ownProps.style) {
    ownProps.style.width = width;
  }

  return React.createElement(
    component,
    {...props, ...ownProps},
    children,
  );
};

function isSizeValueSet(value: any) {
  return !!value || value === 0;
}


const scrollClassValue = {
  'hidden': 'hidden',
  'scroll': true,
  'auto': 'auto',
  'visible': 'visible',
};

function getScrollClasses(scroll?: OverflowValue) {
  function isObject(obj: any): obj is AxisValues<OverflowBasicValue> {
    return isPlainObject(obj);
  }

  function getScrollClass(scroll: keyof typeof scrollClassValue, baseClass: string) {
    return {
      [baseClass]: scrollClassValue[scroll],
    };
  }

  if (isString(scroll)) {
    return getScrollClass(scroll, 'scroll');
  }
  if (isObject(scroll)) {
    return {
      ...getScrollClass(scroll.vertical || 'hidden', 'vertical-scroll'),
      ...getScrollClass(scroll.horizontal || 'hidden', 'horizontal-scroll'),
    };
  }
}

function getPaddingClasses(withPadding: WithPaddingValue) {
  function isObject(obj: any): obj is AxisValues<LayoutUnit | false | null> {
    return isPlainObject(obj);
  }

  if (isArray(withPadding)) {
    const [vertical, horizontal] = withPadding;

    return {
      withHorizontalPadding: horizontal,
      withVerticalPadding: vertical,
    };
  }
  if (isObject(withPadding)) {
    const {
      vertical,
      horizontal,
    } = withPadding;
    return {
      withHorizontalPadding: horizontal,
      withVerticalPadding: vertical,
    };
  }

  return { withPadding };
}


export default LayoutElement;
