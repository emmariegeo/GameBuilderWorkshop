import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import FormatColorFillOutlined from '@mui/icons-material/FormatColorFillOutlined';
import AspectRatioOutlined from '@mui/icons-material/AspectRatioOutlined';
import RotateLeftOutlined from '@mui/icons-material/RotateLeftOutlined';
import FlipOutlined from '@mui/icons-material/FlipOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';

export default function Toolbox() {
  const [view, setView] = React.useState('list');

  const handleChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setView(nextView);
  };

  return (
        <ToggleButtonGroup
        orientation="vertical"
        value={view}
        exclusive
        onChange={handleChange}
      >
        <ToggleButton value="select" aria-label="select">
          <NearMeOutlined />
        </ToggleButton>
        <ToggleButton value="delete" aria-label="delete">
          <DeleteOutlined />
        </ToggleButton>
        <ToggleButton value="fill" aria-label="fill">
          <FormatColorFillOutlined />
        </ToggleButton>
        <ToggleButton value="resize" aria-label="resize">
          <AspectRatioOutlined />
        </ToggleButton>
        <ToggleButton value="rotate" aria-label="rotate">
          <RotateLeftOutlined />
        </ToggleButton>
        <ToggleButton value="flip" aria-label="flip">
          <FlipOutlined />
        </ToggleButton>
        <ToggleButton value="duplicate" aria-label="duplicate">
          <ContentCopyOutlined />
        </ToggleButton>
      </ToggleButtonGroup>
    )
  }