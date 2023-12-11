export interface ColorPallete {
    [key: string]: {
        [key: number]: string;
    };
}

export const Colors: ColorPallete = {
    primary: {
        100: '#008170',
        200: '#358f7f',
        300: '#539d8e',
        400: '#6daa9d',
        500: '#86b8ad',
        600: '#9ec6bd',
    },
    surface: {
        100: '#232d3f',
        200: '#384152',
        300: '#4f5666',
        400: '#666c7a',
        500: '#7e838f',
        600: '#969aa4',
    },
    surfaceMixed: {
        100: '#243544',
        200: '#3a4957',
        300: '#505d6a',
        400: '#67727e',
        500: '#7f8892',
        600: '#979fa7',
    },
    foreground: {
        100: '#ffffff',
        200: '#f2f2f2',
        300: '#e5e5e5',
        400: '#d9d9d9',
        500: '#cccccc',
        600: '#bfbfbf',
    },
    red: {
        100: '#FFEBEE',
        200: '#FFCDD2',
        300: '#EF9A9A',
        400: '#E57373',
        500: '#F44336',
        600: '#E53935',
    }
};
