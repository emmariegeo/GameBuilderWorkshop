import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dynamic from 'next/dynamic';
import { v4 as uuid } from 'uuid';

import {
  switchMode,
  useAppSelector,
  useAppDispatch,
  dialogOpened,
  entityDeleted,
  entityAdded,
  entityById,
  dialogState,
  select,
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
import { Entity, EntityType } from '@/data/types';

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
    dispatch(dialogOpened(dialogState.Closed));
  };

  const handleDeleteObject = () => {
    dispatch(dialogOpened(dialogState.Closed));
    dispatch(entityDeleted(selected));
  };

  const handleDuplicateObject = () => {
    let clone = {...entityById(selected)};
    // Duplicated player sprites become an obstacle
    if (clone?.type == EntityType.Player) {
      clone.type = EntityType.Obstacle;
      clone.physics = 'STATIC';
    }

    dispatch(dialogOpened(dialogState.Closed));
    if (clone?.id !== undefined) {
      clone.id = uuid();
      clone.x = clone.x ? clone.x + 20 : 20
      clone.y = clone.y ? clone.y + 20 : 20
      dispatch(entityAdded(clone as Entity));
      dispatch(select(clone.id));
    }
  };

  const deleteContent = (
    <>
      <DialogTitle id="alert-dialog-title">{'Delete game object?'}</DialogTitle>
      <DialogActions>
        <Button onClick={handleDeleteObject} autoFocus>
          Delete
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </>
  );

  const duplicateContent = (
    <>
      <DialogTitle id="alert-dialog-title">
        {'Duplicate the selected game object?'}
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleDuplicateObject} autoFocus>
          Duplicate
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </>
  );

  return (
    <>
      <Dialog
        open={dialogOpen !== dialogState.Closed}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {dialogOpen === dialogState.Delete && deleteContent}
        {dialogOpen === dialogState.Duplicate && duplicateContent}
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
