import * as React from 'react';
import { Box, Button, Divider, ImageList, ImageListItem, SwipeableDrawer, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { data } from '../data/assets.ts';
import { entityAdded, updateBackground, useAppDispatch, useAppSelector } from '@/store.ts';
import { Entity, EntityType } from '@/data/types.ts';
import { v4 as uuid } from 'uuid';

type Anchor = 'bottom'

export default function AssetsDrawer() {
    // Drawer state
    const [state, setState] = React.useState({
        bottom: false,
    });

    // Currently shown type of asset, default to backgrounds
    const [assetType, setAssetType] = React.useState("backgrounds");

    // Switch between asset type displayed
    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAssetType: string,
    ) => {
        setAssetType(newAssetType);
    };

    // Get current background from store
    const background = useAppSelector(state => state.options.background);
    // Dispatch to store
    const dispatch = useAppDispatch();

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
    const assets: { [index: string]: { [id: string]: { img?: string, title?: string } } } = data;

    // Dispatch to store: Update background
    const changeBackground = (newBackground: string) => {
        dispatch(updateBackground(newBackground));
    }

    // When an asset is clicked
    const handleAssetClick = (itemKey: string) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (assetType == "backgrounds") {
            changeBackground(itemKey);
        } else if (assetType == "sprites") {
            let playerSample: Entity = { id: itemKey+uuid(), x: 100, y: 450, z: 1, width: data['sprites'][itemKey].width !== undefined ? data['sprites'][itemKey].width : 32, height: data['sprites'][itemKey].height !== undefined ? data['sprites'][itemKey].height : 32, scale: 1, orientation: 0, spriteUrl: data['sprites'][itemKey].img, physics: 'arcade', type: EntityType.Player, loaded: false }
            dispatch(entityAdded(playerSample));
        }
    }

    // Drawer content
    const content = (anchor: Anchor) => (
        <Box
            sx={{ width: 'auto' }}
            role="presentation"
        >
            <ToggleButtonGroup
                color="primary"
                value={assetType}
                exclusive
                onChange={handleChange}
                aria-label="Asset Types"
            >
                <ToggleButton value="backgrounds">Backgrounds</ToggleButton>
                <ToggleButton value="sprites">Sprites</ToggleButton>
                <ToggleButton value="items">Items</ToggleButton>
                <ToggleButton value="obstacles">Obstacles</ToggleButton>
                <ToggleButton value="effects">Effects</ToggleButton>
                <ToggleButton value="audio">Audio</ToggleButton>
            </ToggleButtonGroup>
            <Divider />
            <ImageList sx={{ width: 1200, height: 600 }} cols={6} rowHeight={200}>
                {Object.entries(assets[assetType]).map(item => (
                    <Button onClick={handleAssetClick(item[0])} sx={{ width: 164, height: 164 }} key={item[0]}>
                        <ImageListItem>
                            <img
                                srcSet={`${item[1].img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                src={`${item[1].img}?w=164&h=164&fit=crop&auto=format`}
                                alt={item[1].title}
                                loading="lazy"
                            />
                        </ImageListItem>
                    </Button>
                ))}
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