import * as React from 'react';
import { v4 as uuid } from 'uuid';
import Image from 'next/image';
import {
  Box,
  Button,
  Container,
  Divider,
  SwipeableDrawer,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { data } from '../data/assets.ts';
import {
  entityAdded,
  entityById,
  updateAudio,
  updateBackground,
  useAppDispatch,
  useAppSelector,
} from '@/store.ts';
import { Entity, EntityType } from '@/data/types.ts';

type Anchor = 'bottom';

export default function AssetsDrawer() {
  // Drawer state
  const [state, setState] = React.useState({
    bottom: false,
  });

  // Currently shown type of asset, default to backgrounds
  const [assetType, setAssetType] = React.useState('backgrounds');

  // Switch between asset type displayed
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAssetType: string
  ) => {
    if (newAssetType) {
      setAssetType(newAssetType);
    }
  };

  // Get current background, audio, mode from store
  const [background, audio, mode] = useAppSelector((state) => [
    state.canvas.background,
    state.canvas.audio,
    state.canvas.mode,
  ]);

  // Dispatch to store
  const dispatch = useAppDispatch();

  const player = entityById('player');

  // Toggle asset drawer
  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };
  // Asset data from external file
  const assets: {
    [index: string]: {
      [id: string]: {
        width?: any;
        height?: any;
        img: string;
        title?: string;
      };
    };
  } = data;

  // Dispatch to store: Update background
  const changeBackground = (newBackground: string) => {
    dispatch(updateBackground(newBackground));
  };

  // Dispatch to store: Update background
  const changeAudio = (newAudio: string) => {
    dispatch(updateAudio(newAudio));
  };

  // When an asset is clicked
  const handleAssetClick =
    (itemKey: string) => (event: React.KeyboardEvent | React.MouseEvent) => {
      switch (assetType) {
        case 'backgrounds':
          changeBackground(itemKey);
          break;
        case 'audio':
          changeAudio(itemKey);
          break;
        case 'platforms':
          let platform: Entity = {
            id: uuid(),
            x: 100,
            y: 450,
            z: 1,
            title: data[assetType][itemKey].title ?? assetType,
            width: data[assetType][itemKey].width ?? 100,
            height: data[assetType][itemKey].height ?? 100,
            scaleX: 1,
            scaleY: 1,
            scale: 1,
            orientation: 0,
            spriteUrl: data[assetType][itemKey].img,
            spriteWidth: data[assetType][itemKey].width ?? 100,
            spriteHeight: data[assetType][itemKey].height ?? 100,
            physics: 'arcade',
            type: EntityType.Platform,
            loaded: false,
          };
          dispatch(entityAdded(platform));
          break;
        case 'sprites':
          let playerSprite: Entity = {
            id: 'player',
            x: player?.x ?? 100,
            y: player?.y ?? 450,
            z: player?.z ?? 1,
            title: data['sprites'][itemKey].title ?? 'sprite',
            width:
              (data['sprites'][itemKey].width ?? 32) * (player?.scaleX ?? 1),
            height:
              (data['sprites'][itemKey].height ?? 32) * (player?.scaleY ?? 1),
            scaleX: player?.scaleX ?? 1,
            scaleY: player?.scaleY ?? 1,
            scale: player?.scale ?? 1,
            orientation: player?.orientation ?? 0,
            spriteUrl: data['sprites'][itemKey].img,
            spriteWidth: data['sprites'][itemKey].width ?? 32,
            spriteHeight: data['sprites'][itemKey].height ?? 32,
            physics: 'arcade',
            type: EntityType.Player,
            loaded: false,
          };
          dispatch(entityAdded(playerSprite));
          break;
        case 'items':
          let item: Entity = {
            id: uuid(),
            x: 100,
            y: 450,
            z: 1,
            title: data['items'][itemKey].title ?? 'item',
            width: data['items'][itemKey].width ?? 32,
            height: data['items'][itemKey].height ?? 32,
            scaleX: 1,
            scaleY: 1,
            scale: 1,
            orientation: 0,
            spriteUrl: data['items'][itemKey].img,
            spriteWidth: data['items'][itemKey].width ?? 32,
            spriteHeight: data['items'][itemKey].height ?? 32,
            physics: 'arcade',
            type: EntityType.Item,
            loaded: false,
          };
          dispatch(entityAdded(item));
          break;
        case 'obstacles':
          let obstacle: Entity = {
            id: uuid(),
            x: 100,
            y: 450,
            z: 1,
            title: data['obstacles'][itemKey].title ?? 'obstacle',
            width: data['obstacles'][itemKey].width ?? 14,
            height: data['obstacles'][itemKey].height ?? 14,
            scaleX: 1,
            scaleY: 1,
            scale: 1,
            orientation: 0,
            spriteUrl: data['obstacles'][itemKey].img,
            spriteWidth: data['obstacles'][itemKey].width ?? 14,
            spriteHeight: data['obstacles'][itemKey].height ?? 14,
            physics: data['obstacles'][itemKey].physics ?? 'STATIC',
            type: EntityType.Obstacle,
            loaded: false,
          };
          dispatch(entityAdded(obstacle));
          break;
      }
    };

  // Drawer content
  const content = (anchor: Anchor) => (
    <Container maxWidth={'xl'} role="presentation">
      <ToggleButtonGroup
        color="primary"
        value={assetType}
        sx={{ display: 'flex', flexWrap: 'wrap' }}
        exclusive
        onChange={handleChange}
        aria-label="Asset Types"
      >
        <ToggleButton value="backgrounds" defaultChecked>
          Backgrounds
        </ToggleButton>
        <ToggleButton value="platforms">Platforms</ToggleButton>
        <ToggleButton value="sprites">Sprites</ToggleButton>
        <ToggleButton value="items">Items</ToggleButton>
        <ToggleButton value="obstacles">Obstacles</ToggleButton>
        <ToggleButton value="effects">Effects</ToggleButton>
        <ToggleButton value="audio">Audio</ToggleButton>
      </ToggleButtonGroup>
      <Divider />
      <Box
        display={'grid'}
        gridTemplateColumns="repeat(auto-fill, 164px)"
        gap={4}
        paddingY={2}
        sx={{
          width: 'auto',
          height: '600px',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {Object.entries(assets[assetType]).map((item) => (
          <Button
            onClick={handleAssetClick(item[0])}
            sx={{
              width: 164,
              height: 164,
              border:
                item[0] === audio || item[0] === background
                  ? '5px solid blue'
                  : '0',
            }}
            key={item[0]}
          >
            <Box sx={{ width: '100%', height: '164px', position: 'relative' }}>
              <Image
                src={item[1].img}
                alt={item[1].title ?? 'asset'}
                fill={true}
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 164px) 100vw"
              />
            </Box>
          </Button>
        ))}
        {assetType == 'audio' && (
          <Button
            onClick={handleAssetClick('')}
            sx={{ width: 164, height: 164 }}
            key={'clear'}
          >
            <Box sx={{ width: '100%', height: '164px', position: 'relative' }}>
              <Image src="/workshop/x.png" alt="clear" fill={true} />
            </Box>
          </Button>
        )}
      </Box>
    </Container>
  );

  return (
    <Box>
      <React.Fragment key={'assets'}>
        <Tooltip title="Add assets to your game" placement="top">
          <Button
            disabled={mode !== 'edit'}
            variant="contained"
            fullWidth
            onClick={toggleDrawer('bottom', true)}
          >
            {'Open Assets Drawer'}
          </Button>
        </Tooltip>
        <SwipeableDrawer
          PaperProps={{
            sx: {
              width: { md: '60%' },
              left: { md: '20%' },
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
            },
          }}
          anchor={'bottom'}
          open={state['bottom']}
          onClose={toggleDrawer('bottom', false)}
          onOpen={toggleDrawer('bottom', true)}
        >
          {content('bottom')}
        </SwipeableDrawer>
      </React.Fragment>
    </Box>
  );
}
