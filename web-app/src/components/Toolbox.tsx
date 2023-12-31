import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import AspectRatioOutlined from '@mui/icons-material/AspectRatioOutlined';
import FlipOutlined from '@mui/icons-material/FlipOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import { Tool } from '@/data/types';
import { switchTool, useAppDispatch, useAppSelector } from '@/store';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

/**
 * Toolbox provides a toggle menu of tools to edit the game
 */
const Toolbox = () => {
  const theme = useTheme();
  // Breakpoint for switching to vertical/horizontal toggle buttons
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  // Get current tool and canvas mode from store
  const [tool, mode] = useAppSelector((state) => [
    state.canvas.tool,
    state.canvas.mode,
  ]);

  // Dispatch connection to store
  const dispatch = useAppDispatch();

  // Handle changing tools
  const handleChangeTool = async (
    event: React.MouseEvent<HTMLElement>,
    newTool: Tool | null
  ) => {
    if (newTool !== null) {
      dispatch(switchTool(newTool));
    }
  };

  return (
    <Stack
      direction={'column'}
      sx={{ height: '100%', borderRadius: '4px', width: 'auto' }}
      justifyContent={'center'}
      alignItems={'center'}
    >
      {!matches && (
        <Box padding={1}>
          <Typography variant="overline">Toolbox</Typography>
        </Box>
      )}
      <Box
        bgcolor={'#e3f2fd'}
        display={'flex'}
        flex={'column-wrap'}
        justifyContent={'space-between'}
        sx={{ height: '100%', padding: '2px', borderRadius: '4px' }}
        width={'100%'}
      >
        <ToggleButtonGroup
          orientation={matches ? 'horizontal' : 'vertical'}
          color="primary"
          value={tool}
          sx={{
            backgroundColor: 'white',
            height: 'fit-content',
            display: 'flex',
            flexWrap: 'wrap',
          }}
          exclusive
          onChange={handleChangeTool}
          disabled={mode !== 'edit'}
        >
          <ToggleButton value={Tool.Select} aria-label="select">
            <Tooltip title="Selection tool" placement="right">
              <NearMeOutlined />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={Tool.Delete} aria-label="delete">
            <Tooltip title="Delete tool" placement="right">
              <DeleteOutlined />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={Tool.Resize} aria-label="resize">
            <Tooltip title="Resize tool" placement="right">
              <AspectRatioOutlined />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={Tool.Flip} aria-label="flip">
            <Tooltip title="Flip tool" placement="right">
              <FlipOutlined />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={Tool.Duplicate} aria-label="duplicate">
            <Tooltip title="Duplicate tool" placement="right">
              <ContentCopyOutlined />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        {matches && (
          <Box padding={1} width={'auto'}>
            <Typography variant="overline">Toolbox</Typography>
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default Toolbox;
