// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';
import {
  AlignItemsValue,
  JustifyContentValue,
  SpacedChildrenValue,
} from 'common/components/layout/types';
import { LayoutElementProps } from 'common/components/layout/layout-element/LayoutElement';
import LayoutElement from 'common/components/layout/layout-element/LayoutElement';

// Module
import './LayoutRow.less';

interface LayoutRowProps extends LayoutElementProps {
  inline?: boolean,
  spacedChildren?: SpacedChildrenValue
  alignItems?: AlignItemsValue
  justifyContent?: JustifyContentValue
}

const block = bemBlock('n-layout-row');

const LayoutRow: React.FC<LayoutRowProps> = ({
  alignItems = 'stretch',
  className,
  inline,
  justifyContent = 'start',
  spacedChildren = false,
  span = 'greedy',
  ...props
}) => {
  const ownProps = {
    className: block({
      modifiers: {
        inline,
        alignItems,
        'justify-content': justifyContent,
        spacedChildren,
      },
      extra: className,
    }),
    span,
  };

  return (
    <LayoutElement
      {...props}
      {...ownProps}
    />
  );
};

export default LayoutRow;
