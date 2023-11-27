import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { entityById, store } from '@/store';
import { useState } from 'react';
import {
  Box,
  Grid
} from '@mui/material';

export default function OptionsMenu(this: any) {
  // Get the selected entity by its id using the currently selected from store
  let [selectedEntity, setSelectedEntity] = useState(entityById(''));

  const onStoreChange = () => {
    const state = store.getState();
    // When the store changes, reretrieve the entity to check for data changes
    setSelectedEntity(entityById(state.canvas.selected));
  };

  const rows: { prop: string; value: any }[] = [
    {
      prop: 'x',
      value: selectedEntity?.x,
    },
    {
      prop: 'y',
      value: selectedEntity?.y,
    },
    {
      prop: 'z',
      value: selectedEntity?.z,
    },
    {
      prop: 'Height',
      value: selectedEntity?.height,
    },
    {
      prop: 'Width',
      value: selectedEntity?.width,
    },
    {
      prop: 'Scale',
      value: selectedEntity?.scale,
    },
    {
      prop: 'ScaleX',
      value: selectedEntity?.scaleX,
    },
    {
      prop: 'ScaleY',
      value: selectedEntity?.scaleY,
    },
    {
      prop: 'Sprite',
      value: selectedEntity?.spriteUrl,
    },
    {
      prop: 'Orientation',
      value: selectedEntity?.orientation,
    },
    {
      prop: 'Physics',
      value: selectedEntity?.physics,
    },
  ];

  // Subscribing to store so we can handle updates
  store.subscribe(onStoreChange.bind(this));
  return (
    <Card sx={{ maxWidth: 600, width: '100%' }}>
      <Box padding={1} width={'auto'}>
        <Typography variant="overline">Selected</Typography>
      </Box>
      <CardMedia
        sx={{ height: 140 }}
        image={
          selectedEntity?.spriteUrl
            ? selectedEntity?.spriteUrl
            : 'assets/phaser3-logo.png'
        }
        title={selectedEntity?.id ? selectedEntity?.id : ''}
      />
      <CardContent sx={{ paddingX: '8px' }}>
        <Grid
          container
          spacing={0}
          columns={{ xs: 4, sm: 8, md: 12 }}
          height={'300px'}
          sx={{ overflowY: 'auto' }}
        >
          {rows.map((row) => (
            <Grid
              container
              item
              key={row.prop}
              columns={{ xs: 4, sm: 8, md: 12 }}
              columnSpacing={2}
              justifyContent={'space-between'}
            >
              <Grid item xs={'auto'}>
                <Typography variant="caption">{row.prop}</Typography>
              </Grid>
              <Grid
                item
                sx={{
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                  textAlign: 'right',
                }}
              >
                <Typography variant="caption">{row.value}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      <CardActions>
        <Button size="small">Delete</Button>
      </CardActions>
    </Card>
  );
}
