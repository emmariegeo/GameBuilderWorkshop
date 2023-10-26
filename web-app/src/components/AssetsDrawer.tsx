import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Divider } from '@mui/material';

type Anchor = 'bottom'

export default function AssetsDrawer() {
    const [state, setState] = React.useState({
        bottom: false,
    });

    const [alignment, setAlignment] = React.useState('web');

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string,
    ) => {
        setAlignment(newAlignment);
    };

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

    const content = (anchor: Anchor) => (
        <Box
            sx={{ width: 'auto' }}
            role="presentation"
        >
            <ToggleButtonGroup
                color="primary"
                value={alignment}
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
            Stuff here
        </Box>
    );

    return (
        <div>
            {(['bottom'] as const).map((anchor) => (
                <React.Fragment key={anchor}>
                    <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>
                    <SwipeableDrawer
                        anchor={anchor}
                        open={state[anchor]}
                        onClose={toggleDrawer(anchor, false)}
                        onOpen={toggleDrawer(anchor, true)}
                    >
                        {content(anchor)}
                    </SwipeableDrawer>
                </React.Fragment>
            ))}
        </div>
    );
}