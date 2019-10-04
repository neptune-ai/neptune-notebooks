// Libs
import React from 'react';

// App
import { bemBlock } from "common/utils/bem";

// Module
import './ValidationIcon.less';

export type StatusValue = 'success' | 'error' | 'pending';
interface ValidationIconProps {
  status?: StatusValue
}

const block = bemBlock('validation-icon');

const ValidationIcon: React.FC<ValidationIconProps> = ({
  status,
}) => {
  return (
    <div className={block()}>
      {
        status && (
          <i className={block({element: 'icon', modifiers:{status}, extra: getIconClasses(status)})} />
        )
      }
    </div>
  );
};

function getIconClasses(status: StatusValue): string[] | undefined {
  switch (status) {
    case 'pending':
      return ['fa', 'fa-lg', 'fa-spinner', 'fa-spin'];
    case 'success':
      return ['fa', 'fa-2x', 'fa-check-circle'];
    case 'error':
      return ['fa', 'fa-2x', 'fa-times-circle'];
    default:
      return;
  }
}

export default ValidationIcon;
