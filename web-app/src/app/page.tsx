'use client';
import Canvas from '@/components/Canvas';
import Navigation from '@/components/Navigation';
import { Container, Grid } from '@mui/material';
import Toolbox from '@/components/Toolbox';
import OptionsMenu from '@/components/OptionsMenu';
import AssetsDrawer from '@/components/AssetsDrawer';
import { Provider } from 'react-redux';
import { store } from '@/store';

export default function Home() {
  return (
    <Container>
      <Provider store={store}>
        <Navigation>
          <Container>
            <Grid
              container
              sx={{ height: '100%' }}
              spacing={0}
              columns={{ xs: 8, sm: 8, md: 12 }}
            >
              <Grid item xs={8} sm={2}>
                <Toolbox />
              </Grid>
              <Grid item xs={12} sm={8} sx={{ overflow: 'hidden', padding: 0 }}>
                <Canvas />
              </Grid>
              <Grid item xs={8} sm={2}>
                <OptionsMenu />
              </Grid>
            </Grid>
          </Container>
        </Navigation>
        <AssetsDrawer />
      </Provider>
    </Container>
  );
}
