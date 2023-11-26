import * as React from 'react';
import { v4 as uuid } from 'uuid';
import Image from 'next/image';
import {
  Box,
  Button,
  Divider,
  ImageList,
  ImageListItem,
  SwipeableDrawer,
  ToggleButton,
  ToggleButtonGroup,
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

  // Get current background and audio from store
  const [background, audio] = useAppSelector((state) => [
    state.canvas.background,
    state.canvas.audio,
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
    <Box sx={{ width: 'auto' }} role="presentation">
      <ToggleButtonGroup
        color="primary"
        value={assetType}
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
      <ImageList sx={{ width: 1200, height: 600 }} cols={6} rowHeight={200}>
        {Object.entries(assets[assetType]).map((item) => (
          <Button
            onClick={handleAssetClick(item[0])}
            sx={{
              width: 164,
              height: 164,
              border: item[0] === audio || item[0] === background ? '5px solid blue' : '0',
            }}
            key={item[0]}
          >
            <ImageListItem sx={{ width: '100%' }}>
              <Image
                src={item[1].img}
                alt={item[1].title ?? 'asset'}
                fill={true}
              />
            </ImageListItem>
          </Button>
        ))}
        {assetType == 'audio' && (
          <Button
            onClick={handleAssetClick('')}
            sx={{ width: 164, height: 164 }}
            key={'clear'}
          >
            <ImageListItem sx={{ width: '100%' }}>
              <Image
                src="/workshop/x.png"
                alt="clear"
                fill={true}
              />
            </ImageListItem>
          </Button>
        )}
      </ImageList>
    </Box>
  );

  return (
    <div>
      <React.Fragment key={'assets'}>
        <Button onClick={toggleDrawer('bottom', true)}>{'assets'}</Button>
        <SwipeableDrawer
          anchor={'bottom'}
          open={state['bottom']}
          onClose={toggleDrawer('bottom', false)}
          onOpen={toggleDrawer('bottom', true)}
        >
          {content('bottom')}
        </SwipeableDrawer>
      </React.Fragment>
    </div>
  );
}
