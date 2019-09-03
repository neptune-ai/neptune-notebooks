import React from 'react';

import ToolbarWrapper from 'platform/components/ToolbarWrapper';
import ToolbarButton from 'platform/components/ToolbarButton';

const App = () => {
  const [clicked, setClicked] = React.useState(false);

  return (
    <div id="neptune-app">
      <ToolbarWrapper>
        <ToolbarButton
          label={'Configure'}
          title="Connect to Neptune"
          icon="neptune"
          compact={clicked}
          onClick={() => {
            setClicked(true);
            console.log('neptune button clicked.');
          }}
        />
        <ToolbarButton
          label="Upload"
          title="Upload to Neptune"
          icon="fa-cloud-upload"
          visible={clicked}
          onClick={() => console.log('upload button clicked.')}
        />
      </ToolbarWrapper>
    </div>
  );
}

export default App;

