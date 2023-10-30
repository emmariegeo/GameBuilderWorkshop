import * as React from 'react';
import { Box, Button, Divider, ImageList, ImageListItem, SwipeableDrawer, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { data } from '../data/assets.ts';

type Anchor = 'bottom'

export default function AssetsDrawer() {
    const [state, setState] = React.useState({
        bottom: false,
    });

    const [assetType, setAssetType] = React.useState("backgrounds");

    // switch between asset type displayed
    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAssetType: string,
    ) => {
        setAssetType(newAssetType);
    };

    // toggle asset drawer
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

    const assets: { [index: string]: { [id: string]: { img?: string, title?: string } } } = data;

    // update background
    const updateBackground = (newBackground: string) =>
        (event: React.KeyboardEvent | React.MouseEvent) => {
            sessionStorage.setItem("background", newBackground);
        }

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
                    <Button onClick={updateBackground(item[0])} sx={{ width: 164, height: 164 }} key={item[0]}>
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