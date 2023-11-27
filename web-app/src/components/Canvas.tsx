import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dynamic from 'next/dynamic';

import {
  switchMode,
  useAppSelector,
  useAppDispatch,
  dialogOpened,
  entityDeleted,
} from '@/store';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

const PhaserGame = dynamic(
  () => import('./PhaserGame').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <Box
        width={'100%'}
        height={'100%'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <CircularProgress />
      </Box>
    ),
  }
);

const Canvas = () => {
  // canvas mode and dialog state from store
  const mode = useAppSelector((state) => state.canvas.mode);
  const dialogOpen = useAppSelector((state) => state.canvas.dialogOpen);
  const selected = useAppSelector((state) => state.canvas.selected);

  // dispatch to store
  const dispatch = useAppDispatch();

  // Handle canvas mode on toggle
  const handleCanvasMode = async (
    event: React.MouseEvent<HTMLElement>,
    newCanvasMode: string | null
  ) => {
    if (newCanvasMode !== null) {
      dispatch(switchMode(newCanvasMode));
    }
  };

  const handleClose = () => {
    dispatch(dialogOpened(false));
  };

  const handleDeleteObject = () => {
    dispatch(dialogOpened(false));
    dispatch(entityDeleted(selected));
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Delete game object?'}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteObject} autoFocus>
            Delete
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Stack
        bgcolor={'#e3f2fd'}
        sx={{
          height: '100%',
          width: '100%',
          padding: '2px',
          borderRadius: '4px',
        }}
      >
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Box padding={1}>
            <Typography variant="overline">Canvas Mode</Typography>
          </Box>
          <ToggleButtonGroup
            value={mode}
            exclusive
            sx={{ backgroundColor: 'white' }}
            color="primary"
            onChange={handleCanvasMode}
            aria-label="canvas mode"
          >
            <ToggleButton value="edit" aria-label="edit mode">
              <Tooltip title="Edit your game" placement="top">
                <Typography variant="button">Edit</Typography>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="play" aria-label="play mode">
              <Tooltip title="Preview your game" placement="top">
                <Typography variant="button">Play</Typography>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <PhaserGame />
      </Stack>
    </>
  );
};
export default Canvas;
