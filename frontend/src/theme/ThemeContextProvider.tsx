import React from 'react';
import {createTheme, Theme} from '@mui/material/styles';
import { createContext, FC, PropsWithChildren, useContext } from 'react';
import { useColorTheme } from './use-color-theme';

type ThemeContextType = {
    mode : 'light' | 'dark';
    theme : Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    theme: createTheme(),
    toggleTheme: () => {},
});

export const ThemeContextProvider: FC<PropsWithChildren<{}>> = ({children}) => {
    const value = useColorTheme();
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useThemeContext = () => useContext(ThemeContext);
