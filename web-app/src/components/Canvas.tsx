import * as React from 'react';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function Canvas() {
  const [canvasMode, setCanvasMode] = React.useState('edit');

  const handleCanvasMode = (
    event: React.MouseEvent<HTMLElement>,
    newCanvasMode: string | null,
  ) => {
    if (newCanvasMode !== null) {
      setCanvasMode(newCanvasMode);
    }
  };
  return (
    <>
      <ToggleButtonGroup
        value={canvasMode}
        exclusive
        onChange={handleCanvasMode}
        aria-label="canvas mode"
      >
        <ToggleButton value="edit" aria-label="edit mode">
          Edit
        </ToggleButton>
        <ToggleButton value="play" aria-label="play mode">
          Play
        </ToggleButton>
      </ToggleButtonGroup>
      <div className="iframe-container">
        <iframe src={`http://localhost:8080?mode=${canvasMode}`} className="responsive-iframe" />
      </div></>
  )
}
