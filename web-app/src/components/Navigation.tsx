import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Divider,
  ListItemButton,
  ListItem,
  List,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Link,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { ReactNode, useState } from 'react';
import Tutorial from './Tutorial';

/**
 * Top navigation bar and help/about dialog
 * @param props children (page content)
 */
const Navigation = (props: { children: ReactNode }) => {
  const drawerWidth = 240;
  const navItems = ['Help'];

  // Managing mobile vs screen view of navigation
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // Managing Help dialog listeners and state
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Game Builder Workshop
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              onClick={handleClickOpen}
            >
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Game Builder Workshop
          </Typography>
          <Box sx={{ display: 'block' }}>
            {navItems.map((item) => (
              <Button
                key={item}
                sx={{ color: '#fff' }}
                onClick={handleClickOpen}
              >
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box component="main" sx={{ p: 3, width: '100%' }}>
        <Toolbar />
        {/* Main page content will be here */}
        {props.children}
        {/* Help/About Dialog */}
        <Dialog
          onClose={handleClose}
          aria-labelledby="help-dialog-title"
          open={open}
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
            About Game Builder Workshop
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent dividers>
            <Typography gutterBottom>
              Game Builder Workshop provides an interface for creating a 2D
              platformer game with the{' '}
              <Link href="https://phaser.io/Phaser">Phaser</Link> HTML5 game
              engine.
            </Typography>
          </DialogContent>
          <Tutorial />
          <DialogActions>
            <Button autoFocus onClick={handleClose}>
              Learn More
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};
export default Navigation;
