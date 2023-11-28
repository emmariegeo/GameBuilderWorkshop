import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Stack,
} from '@mui/material';
import { startData } from '@/data/startData';
import { data as assets } from '@/data/assets.ts';
import { entitiesAdded, store, useAppDispatch } from '@/store';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useState } from 'react';

const ActionButtons = () => {
  // dispatch to store
  const [dialogOpen, dialogOpened] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(undefined);
  const [dialogType, setDialogType] = useState('export');

  const dispatch = useAppDispatch();

  const handleNewGame = async (event: React.MouseEvent<HTMLElement>) => {
    dispatch(entitiesAdded(startData));
    dialogOpened(false);
  };

  const handleClose = () => {
    dialogOpened(false);
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    let state = store.getState();

    let exportdata = {
      background: {
        img: assets['backgrounds'][state.canvas.background]['img'] ?? '',
      },
      audio: {
        file: assets['audio'][state.canvas.audio]?.file ?? '',
        title: assets['audio'][state.canvas.audio]?.title ?? '',
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
        // Copy over game files
        zip.file('game.js', data, { binary: true });
      });
    await fetch('/export/index.html')
      .then((res) => res.text())
      .then((data) => {
        let blob = new Blob([data], { type: 'text/html' });
        // Copy over html
        zip.file('index.html', blob, { binary: true });
      });

    fetch('/export/launchgame.exe')
      .then((res) => res.blob())
      .then((data) => {
        // Copy over executable for launching game
        zip.file('launchgame.exe', data, { binary: true });
        zip
          .generateAsync({ type: 'blob' })
          .then(function (content) {
            saveAs(content, 'yourgame.zip');
          })
          .then(() => setExportSuccess(true))
          .catch((reason) => setExportError(reason));
      });
    dialogOpened(false);
  };

  const exportContent = (
    <>
      <DialogTitle id="alert-dialog-title">{'Export your game.'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You can export your game by downloading a ZIP file below. To play your
          game, extract the ZIP file into a new folder and run the
          'launchgame.exe' file.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleDownload}
          autoFocus
          about="Download your game as a zip file."
        >
          Download game as ZIP File
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </>
  );
  const newGameContent = (
    <>
      <DialogTitle id="alert-dialog-title">{'Create a new game?'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Clicking confirm will erase your existing game. Are you sure you wish
          to continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleNewGame} autoFocus>
          Confirm
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </>
  );
  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {dialogType === 'newgame' ? newGameContent : ''}
        {dialogType === 'export' ? exportContent : ''}
      </Dialog>
      <Snackbar
        open={exportSuccess}
        autoHideDuration={6000}
        onClose={() => {
          setExportSuccess(false);
        }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Success! Your game has been exported.
        </Alert>
      </Snackbar>

      <Snackbar
        open={exportError}
        autoHideDuration={6000}
        onClose={() => {
          setExportError(undefined);
        }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          Something went wrong! Please try again. {exportError}
        </Alert>
      </Snackbar>
      <Stack direction={'row'} spacing={2} justifyContent={'space-between'}>
        <Button
          variant="contained"
          onClick={() => {
            setDialogType('newgame');
            dialogOpened(true);
          }}
        >
          New Game
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setDialogType('export');
            dialogOpened(true);
          }}
        >
          Export
        </Button>
      </Stack>
    </>
  );
};
export default ActionButtons;
