// Libs
import React from 'react';
import { connect } from 'react-redux';

// App
import {
  NotificationPayload,
  removeNotification,
} from 'common/state/notifications/actions';
import Toast from 'common/components/toast/Toast';
import { CheckpointSuccessfulNotification } from 'common/components/notifications/renderers/CheckpointSuccessfulNotification';
import { UpgradeAvailableNotification } from 'common/components/notifications/renderers/UpgradeAvailableNotification';


// Module
type NotificationProps = NotificationPayload & {
  removeNotification: (id: string) => void
};

class Notification extends React.PureComponent<NotificationProps> {
  SUCCEED_TIMEOUT_TIME = 5000;

  timer: number | undefined = undefined;

  componentDidMount() {
    this.setTimer();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer = () => {
    window.clearTimeout(this.timer);
  }

  setTimer = () => {
    this.timer = window.setTimeout(this.remove, this.SUCCEED_TIMEOUT_TIME);
  }

  remove = () => {
    const {
      id,
      removeNotification,
    } = this.props;

    removeNotification(id);
  }

  render() {
    switch (this.props.type) {
      case 'checkpoint-successful': {
        return (
          <CheckpointSuccessfulNotification
            type={this.props.type}
            data={this.props.data}
            onClose={this.remove}
          />
        );
      }

      case 'upgrade-available': {
        return (
          <UpgradeAvailableNotification
            onClose={this.remove}
          />
        );
      }

      default: {
        return (
          <Toast
            type={this.props.type}
            onClose={this.remove}
          >
            {this.props.data}
          </Toast>
        );
      }
    }
  }
}

const mapDispatchToProps = {
  removeNotification,
};

export default connect(null, mapDispatchToProps)(Notification);
