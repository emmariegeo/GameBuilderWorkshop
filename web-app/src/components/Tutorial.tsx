import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Skeleton } from '@mui/material';
import { useState } from 'react';

// Tutorial steps data.
const steps = [
  {
    label: 'Create a New Game',
    imgPath: '/workshop/newgame.gif',
    description: `Start a new game with the new game button.`,
  },
  {
    label: 'Switch between Edit and Play mode',
    imgPath: '',
    description:
      'Edit mode will allow you to make changes to your game, while play mode will let you test the game out.',
  },
  {
    label: 'Selection tool',
    imgPath: '',
    description:
      'Click on the selection tool, then drag and drop objects on your canvas to change their position.',
  },
  {
    label: 'Delete tool',
    imgPath: '',
    description:
      'Click on the delete tool, then click on an object you wish to delete. You will be given the option to delete the object from your game, or cancel.',
  },
  {
    label: 'Resize tool',
    imgPath: '',
    description:
      'Click on the resize tool, then click on an object. Drag the corners of the selected object to change its scale.',
  },
  {
    label: 'Adding assets to your game',
    imgPath: '',
    description:
      'Click to open the assets drawer. Clicking on an asset will add it to your game. Some asset types, like backgrounds, player sprites, and audio, can only exist once in your game. Selecting one of these objects will replace the existing background, player sprite, or audio in your game.',
  },
  {
    label: 'Exporting your game',
    imgPath: '',
    description:
      'To download your game files, click the export button. A dialog will appear, prompting you to confirm you wish to download your game files as a ZIP file.',
  },
  {
    label: 'Running your game',
    imgPath: '',
    description:
      'To run your game locally, extract the ZIP file you have downloaded, then run the launchgame.exe file.',
  },
];

/**
 * Tutorial component explains important steps
 */
const Tutorial = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = steps.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ maxWidth: 600, flexGrow: 1, padding: 2 }}>
      <Paper
        square
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 100,
          pl: 2,
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h4" gutterBottom>
          {steps[activeStep].label}
        </Typography>
      </Paper>
      {steps[activeStep].imgPath ? (
        <Box
          component="img"
          sx={{
            height: 'auto',
            display: 'block',
            maxWidth: 600,
            px: 2,
            overflow: 'hidden',
            width: '100%',
          }}
          src={steps[activeStep].imgPath}
          alt={steps[activeStep].label}
        />
      ) : (
        <Skeleton
          sx={{
            maxWidth: '600px',
            height: '200px',
            width: '100%',
            paddingX: 2,
          }}
        ></Skeleton>
      )}
      <Box sx={{ height: 'auto', maxWidth: 600, width: '100%', p: 2 }}>
        <Typography variant="subtitle1">
          {steps[activeStep].description}
        </Typography>
      </Box>
      <MobileStepper
        variant="text"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            Next
            {theme.direction === 'rtl' ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Back
          </Button>
        }
      />
    </Box>
  );
};

export default Tutorial;
