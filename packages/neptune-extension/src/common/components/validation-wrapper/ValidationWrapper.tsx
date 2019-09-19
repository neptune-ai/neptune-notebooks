// Libs
import React from 'react';

// App
import Layout from 'common/components/layout';
import { bemBlock } from "common/utils/bem";

// Module
import './ValidationWrapper.less';

type StatusValue = 'success' | 'error' | 'pending';
interface ValidationWrapperProps {
  status?: StatusValue
}

const block = bemBlock('validation-wrapper');

const ValidationWrapper: React.FC<ValidationWrapperProps> = ({
  children,
  status,
}) => {
  return (
    <Layout.Row
      className={block()}
      span="auto"
      alignItems="center"
      spacedChildren="sm"
    >
      { children }
      <div className={block('icon-wrapper')}>
        {
          status && (
            <i className={block({element: 'icon', modifiers:{status}, extra: getIconClasses(status)})} />
          )
        }
      </div>
    </Layout.Row>
  )
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


export default ValidationWrapper;
