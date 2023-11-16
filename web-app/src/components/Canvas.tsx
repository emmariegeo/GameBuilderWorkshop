import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dynamic from "next/dynamic";
import { switchMode, useAppSelector, useAppDispatch, entityAdded, entitiesAdded, dialogOpened, entityDeleted, allEntities } from '@/store';
import { startData } from '@/data/startData';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { useState } from 'react';

const PhaserGame = dynamic(() => import("./PhaserGame").then((m) => m.default), {
  ssr: false,
  loading: () => <p>Loading game...</p>,
});

const Canvas = () => {
  // canvas mode and dialog state from store
  const mode = useAppSelector(state => state.canvas.mode);
  const dialogOpen = useAppSelector(state => state.canvas.dialogOpen);
  const selected = useAppSelector(state => state.canvas.selected);

  // dispatch to store
  const dispatch = useAppDispatch();

  // Handle canvas mode on toggle
  const handleCanvasMode = async (
    event: React.MouseEvent<HTMLElement>,
    newCanvasMode: string | null,
  ) => {
    if (newCanvasMode !== null) {
      dispatch(switchMode(newCanvasMode));
    }
  };

  const handleNewGame = async (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    dispatch(entitiesAdded(startData));
  };

  const handleClose = () => {
    dispatch(dialogOpened(false));
  };

  const handleDeleteObject = () => {
    dispatch(dialogOpened(false));
    dispatch(entityDeleted(selected));
  };

  return (
    <><Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Delete game object?"}
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleDeleteObject} autoFocus>Delete</Button>
        <Button onClick={handleClose} >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
      <ToggleButtonGroup
        value={mode}
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
      <PhaserGame />
      <Button onClick={handleNewGame}>New Game</Button>
    </>
  )
}
export default Canvas;