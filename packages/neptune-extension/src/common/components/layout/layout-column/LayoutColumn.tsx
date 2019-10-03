// Libs
import React from 'react';

// App
import {
  AlignItemsValue,
  JustifyContentValue,
  SpacedChildrenValue,
} from 'common/components/layout/types';
import { bemBlock } from 'common/utils/bem';
import { LayoutElementProps } from 'common/components/layout/layout-element/LayoutElement';
import LayoutElement from 'common/components/layout/layout-element/LayoutElement';

// Module
import './LayoutColumn.less';

interface LayoutColumnProps extends LayoutElementProps {
  alignItems?: AlignItemsValue,
  justifyContent? : JustifyContentValue,
  spacedChildren?: SpacedChildrenValue,
}

const block = bemBlock('n-layout-column');

const LayoutColumn: React.FC<LayoutColumnProps> = ({
  alignItems = 'stretch',
  className,
  justifyContent = 'start',
  spacedChildren = false,
  span = 'greedy',
  ...props
}) => {
  const ownProps = {
    className: block({
      modifiers: {
        'justify-content': justifyContent,
        alignItems,
        spacedChildren,
      },
      extra: className,
    }),
  };

  return (
    <LayoutElement
      {...props}
      {...ownProps}
    />
  );
};

export default LayoutColumn;
