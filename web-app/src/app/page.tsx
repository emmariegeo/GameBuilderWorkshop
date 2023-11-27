'use client';
import Canvas from '@/components/Canvas';
import Navigation from '@/components/Navigation';
import { Container, Grid, Stack } from '@mui/material';
import Toolbox from '@/components/Toolbox';
import OptionsMenu from '@/components/OptionsMenu';
import AssetsDrawer from '@/components/AssetsDrawer';
import { Provider } from 'react-redux';
import { store } from '@/store';
import ActionButtons from '@/components/ActionButtons';

export default function Home() {
  return (
    <Container>
      <Provider store={store}>
        <Navigation>
          <Container maxWidth={'xl'} disableGutters>
            <Grid
              container
              rowSpacing={2}
              sx={{ height: '100%', width: '100%' }}
              justifyContent={'space-between'}
              alignItems={'space-between'}
              columns={{ xs: 3, md: 12 }}
            >
              <Grid item xs={3} md={1} height={'auto'}>
                <Toolbox />
              </Grid>
              <Grid item xs={3} md={7} sx={{ width: '100%', height: 'auto' }}>
                <Canvas />
              </Grid>
              <Grid item xs={3} md={3} height={'auto'}>
                <Stack
                  direction={'column'}
                  height={'100%'}
                  justifyContent={'space-between'}
                >
                  <OptionsMenu />
                  <ActionButtons />
                </Stack>
              </Grid>
              <Grid item xs={3} md={12} height={'auto'}>
                <AssetsDrawer />
              </Grid>
            </Grid>
          </Container>
        </Navigation>
      </Provider>
    </Container>
  );
}
