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
import { Tool } from '@/data/types';
import { switchTool, useAppDispatch, useAppSelector } from '@/store';

export default function Toolbox() {
  const tool = useAppSelector(state => state.options.tool);
  const dispatch = useAppDispatch();

  const handleChangeTool = async (
    event: React.MouseEvent<HTMLElement>,
    newTool: Tool | null,
  ) => {
    if (newTool !== null) {
      dispatch(switchTool(newTool));
    }
  };

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={tool}
      exclusive
      onChange={handleChangeTool}
    >
      <ToggleButton value={Tool.Select} aria-label="select">
        <NearMeOutlined />
      </ToggleButton>
      <ToggleButton value={Tool.Delete} aria-label="delete">
        <DeleteOutlined />
      </ToggleButton>
      <ToggleButton value={Tool.Fill} aria-label="fill">
        <FormatColorFillOutlined />
      </ToggleButton>
      <ToggleButton value={Tool.Resize} aria-label="resize">
        <AspectRatioOutlined />
      </ToggleButton>
      <ToggleButton value={Tool.Rotate} aria-label="rotate">
        <RotateLeftOutlined />
      </ToggleButton>
      <ToggleButton value={Tool.Flip} aria-label="flip">
        <FlipOutlined />
      </ToggleButton>
      <ToggleButton value={Tool.Duplicate} aria-label="duplicate">
        <ContentCopyOutlined />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}