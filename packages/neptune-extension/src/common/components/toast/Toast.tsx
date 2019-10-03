// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';
import { EventHandler } from 'common/utils/events';
import * as Layout from 'common/components/layout';

// Module
import './Toast.less';

type ToastType = 'info' | 'warning' | 'error' | 'success';

interface IToastProps {
  className?: string
  onClose?: EventHandler
  type: ToastType
}

const block = bemBlock('toast');

const ICON = {
  info: 'fa-info-circle',
  warning: 'fa-exclamation-triangle',
  error: 'fa-exclamation-circle',
  success: 'fa-check-circle',
};


class Toast extends React.PureComponent<IToastProps> {

  renderIcon() {
    const { type } = this.props;
    const iconGlyph = ICON[type];

    return (
      <i className={block({
          element: 'icon',
          extra: ['fa fa-fw', iconGlyph],
        })}
      />
    );
  }

  renderContent() {
    return (
      <Layout.Element
        className={block('content')}
        span="greedy"
        childSpacing="sm"
      >{this.props.children}</Layout.Element>
    );
  }

  renderActions() {
    const { onClose } = this.props;

    if (!onClose) {
      return null;
    }

    return (
      <i
        className={block({
          element: 'action',
          extra: 'fa fa-times',
        })}
        title="Hide"
        onClick={onClose}
      />
    );
  }

  render() {
    const {
      className,
      type
    } = this.props;

    return (
      <Layout.Row
        className={block({
          modifiers: {
            type,
          },
          extra: className,
        })}
        span="auto"
        withPadding="md"
        spacedChildren="md"
        alignItems="start"
      >
        {this.renderIcon()}
        {this.renderContent()}
        {this.renderActions()}
      </Layout.Row>
    )
  }
}


export default Toast;
