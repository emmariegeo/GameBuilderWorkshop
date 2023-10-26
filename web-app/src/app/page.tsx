"use client"
import Canvas from '@/components/Canvas'
import styles from './page.module.css'
import Navigation from '@/components/Navigation'
import { Container, Grid, Stack, Typography, Box, ButtonGroup, Button } from '@mui/material'
import Toolbox from '@/components/Toolbox'
import OptionsMenu from '@/components/OptionsMenu'
import AssetsDrawer from '@/components/AssetsDrawer'

export default function Home() {
  const buttons = [
    <Button key="one">One</Button>,
    <Button key="two">Two</Button>,
    <Button key="three">Three</Button>,
  ];
  return (
    <Container >
      <Navigation>
        <Container>
          <Grid container sx={{ height: '100%' }} spacing={0} columns={{ xs: 8, sm: 8, md: 12 }}>
            <Grid item xs={8} sm={2}>
                <Toolbox />
            </Grid>
            <Grid item xs={12} sm={8} sx={{ overflow: 'hidden', padding: 0 }}>
              <Canvas />
            </Grid>
            <Grid item xs={8} sm={2}>
              <OptionsMenu/>
            </Grid>
          </Grid>
        </Container>
      </Navigation>
      <AssetsDrawer/>
    </Container>
  )
}
