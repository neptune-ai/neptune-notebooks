// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';
import { EventHandler } from 'common/utils/events';
import * as Layout from 'common/components/layout';

// Module
import './Toast.less';

type ToastType = 'info' | 'warning' | 'error' | 'success';

interface IAction {
  label: string
  onClick: EventHandler
  title?: string
}

interface IToastProps {
  actions: IAction[]
  className?: string
  inProgress?: boolean
  onClose?: EventHandler
  type?: ToastType
}

const block = bemBlock('toast');

const ICON = {
  info: 'fa-info-circle',
  warning: 'fa-exclamation-triangle',
  error: 'fa-exclamation-circle',
  success: 'fa-check-circle',
  spinner: 'fa-spinner fa-spin',
};


class Toast extends React.PureComponent<IToastProps> {

  renderIcon() {
    const {
      inProgress,
      type = 'info'
    } = this.props;
    const iconGlyph = inProgress ? ICON.spinner : ICON[type];

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
    const {
      actions = [],
      onClose
    } = this.props;

    if (actions.length === 0 && !onClose) {
      return null;
    }

    // ''

    return (
      <Layout.Row
        spacedChildren="sm"
        alignItems="center"
        span="auto"
      >
        { actions.map(({ label, title, onClick }, key) => (
            <Layout.Element
              key={key}
              className={block('action')}
              title={title}
              onClick={onClick}
            >
              {label}
            </Layout.Element>
          ))
        }
        {onClose && (
          <i
            className="fa fa-times"
            title="Hide"
            onClick={onClose}
          />
        )}
      </Layout.Row>
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
        alignItems="center"
      >
        {this.renderIcon()}
        {this.renderContent()}
        {this.renderActions()}
      </Layout.Row>
    )
  }
}
