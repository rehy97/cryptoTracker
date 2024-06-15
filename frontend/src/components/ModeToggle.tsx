import {Box, IconButton } from '@mui/material';
import {Brightness4, Brightness7} from '@mui/icons-material';
import { useThemeContext } from '../theme/ThemeContextProvider';

const ModeToggle = () => {
    const {mode, toggleTheme} = useThemeContext();
    return (
        <Box>
            <IconButton onClick={toggleTheme}>
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
        </Box>
    );
}

export default ModeToggle;