import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { entityById, store } from '@/store';
import { useState } from 'react';

export default function OptionsMenu(this: any) {
  // Get the selected entity by its id using the currently selected from store
  let [selectedEntity, setSelectedEntity] = useState(entityById(''));

  const onStoreChange = () => {
    const state = store.getState();
    // When the store changes, reretrieve the entity to check for data changes
    setSelectedEntity(entityById(state.canvas.selected));
  }

  // Subscribing to store so we can handle updates
  store.subscribe(onStoreChange.bind(this))
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        sx={{ height: 140 }}
        image={selectedEntity?.spriteUrl ? selectedEntity?.spriteUrl : 'assets/phaser3-logo.png'}
        title={selectedEntity?.id ? selectedEntity?.id : ''}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {selectedEntity?.type}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          x: {selectedEntity?.x}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          y: {selectedEntity?.y}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          z: {selectedEntity?.z}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Height: {selectedEntity?.height}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Width: {selectedEntity?.width}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sprite: {selectedEntity?.spriteUrl}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Orientation: {selectedEntity?.orientation}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Physics: {selectedEntity?.physics}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Scale: {selectedEntity?.scale}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Save</Button>
        <Button size="small">Delete</Button>
      </CardActions>
    </Card>
  );
}