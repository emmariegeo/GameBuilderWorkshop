import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dynamic from "next/dynamic";
import { switchMode, useAppSelector, useAppDispatch } from '@/store';

const PhaserGame = dynamic(() => import("./PhaserGame").then((m) => m.default), {
  ssr: false,
  loading: () => <p>Loading game...</p>,
});

const Canvas = () => {
  const mode = useAppSelector(state => state.mode);
  const dispatch = useAppDispatch();

  const handleCanvasMode = async (
    event: React.MouseEvent<HTMLElement>,
    newCanvasMode: string | null,
  ) => {
    if (newCanvasMode !== null) {
      dispatch(switchMode(newCanvasMode));
    }
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
    </>
  )
}
export default Canvas;