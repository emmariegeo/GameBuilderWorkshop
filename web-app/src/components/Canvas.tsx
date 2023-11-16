import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dynamic from "next/dynamic";
import { switchMode, useAppSelector, useAppDispatch, entityAdded, entitiesAdded } from '@/store';
import { startData } from '@/data/startData';
import { Button } from '@mui/material';

const PhaserGame = dynamic(() => import("./PhaserGame").then((m) => m.default), {
  ssr: false,
  loading: () => <p>Loading game...</p>,
});

const Canvas = () => {
  // canvas mode from store
  const mode = useAppSelector(state => state.canvas.mode);
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

  return (
    <>
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