import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dynamic from 'next/dynamic';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import {
  switchMode,
  useAppSelector,
  useAppDispatch,
  entityAdded,
  entitiesAdded,
  dialogOpened,
  entityDeleted,
  allEntities,
  store,
} from '@/store';
import { data as assets } from '@/data/assets.ts';
import { startData } from '@/data/startData';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';

const PhaserGame = dynamic(
  () => import('./PhaserGame').then((m) => m.default),
  {
    ssr: false,
    loading: () => <p>Loading game...</p>,
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

  const handleNewGame = async (event: React.MouseEvent<HTMLElement>) => {
    dispatch(entitiesAdded(startData));
  };

  const handleClose = () => {
    dispatch(dialogOpened(false));
  };

  const handleDeleteObject = () => {
    dispatch(dialogOpened(false));
    dispatch(entityDeleted(selected));
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    let state = store.getState();

    let exportdata = {
      background: {
        img: assets['backgrounds'][state.canvas.background]['img'] ?? '',
      },
      audio: {
        file: assets['audio'][state.canvas.audio]['file'] ?? '',
        title: assets['audio'][state.canvas.audio]['title'] ?? '',
      },
      entities: state.entities.entities,
    };

    const exportblob = new Blob([
      'export const data = ' + JSON.stringify(exportdata, null, 2),
    ]);

    // Generate file with game data from store
    zip.file('gamedata.js', exportblob, { binary: true });

    const assetsFolder = zip.folder('assets');
    const subfolders = new Map<string, JSZip | null | undefined>([
      ['audio', assetsFolder?.folder('audio')],
      ['bg', assetsFolder?.folder('backgrounds')],
      ['cursors', assetsFolder?.folder('cursors')],
      ['items', assetsFolder?.folder('items')],
      ['obstacles', assetsFolder?.folder('obstacles')],
      ['platforms', assetsFolder?.folder('platforms')],
      ['sprites', assetsFolder?.folder('sprites')],
    ]);

    let path: string;
    // Copy audio file
    if (exportdata.audio.file) {
      path = exportdata.audio.file.split('/').pop() ?? '';
      await fetch(exportdata.audio.file)
        .then((res) => res.blob())
        .then((data) => {
          subfolders.get('audio')?.file(path, data, { compression: 'STORE' });
        });
    }

    // Copy background file
    path = exportdata.background.img.split('/').pop() ?? '';
    await fetch(exportdata.background.img)
      .then((res) => res.blob())
      .then((data) => {
        subfolders.get('bg')?.file(path, data, { compression: 'STORE' });
      });

    // Copy over cursor .ico files
    await fetch('/assets/cursors/TL_resize.ico')
      .then((res) => res.blob())
      .then((data) => {
        subfolders
          .get('cursors')
          ?.file('TL_resize.ico', data, { compression: 'STORE' });
      });
    await fetch('/assets/cursors/TR_resize.ico')
      .then((res) => res.blob())
      .then((data) => {
        subfolders
          .get('cursors')
          ?.file('TR_resize.ico', data, { compression: 'STORE' });
      });

    // Copy over entity image files
    Object.entries(exportdata.entities).forEach(async ([, entity]) => {
      if (entity?.spriteUrl && !assetsFolder?.file(entity?.spriteUrl)) {
        await fetch(entity?.spriteUrl)
          .then((res) => res.blob())
          .then((data) => {
            let urlParts = entity?.spriteUrl.split('/').slice(-2);
            let folder = urlParts[0];
            let path = urlParts[1];
            subfolders.get(folder)?.file(path, data, { compression: 'STORE' });
          });
      }
    });

    await fetch('/export/game.js')
      .then((res) => res.blob())
      .then((data) => {
        // Copy over python script for launching game
        zip.file('game.js', data, { binary: true });
      });
    await fetch('/export/index.html')
      .then((res) => res.text())
      .then((data) => 
      {
        let blob = new Blob([data],{type: "text/html"})
        // Copy over python script for launching game
        zip.file('index.html', blob, { binary: true });
      });

    fetch('/export/launchgame.exe')
      .then((res) => res.blob())
      .then((data) => {
        // Copy over python script for launching game
        zip.file('launchgame.exe', data, { binary: true });
        zip.generateAsync({ type: 'blob' }).then(function (content) {
          saveAs(content, 'download.zip');
        });
      });
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
      <Button onClick={handleDownload}>Download</Button>
    </>
  );
};
export default Canvas;
