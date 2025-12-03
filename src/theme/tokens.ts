const colors = {
  brandBlack: '#000000',
  brandWhite: '#ffffff',
  brandOrange: '#ff5200',
  brandYellow: '#ffb71a',
  brandLightGray: '#dbdbda',
  brandGray: '#8e8b8a',
  brandMidGray: '#65625f',
  brandDarkGray: '#484442',
  brandOrangeLighter: '#ffd6ba',
  brandOrangeLight: '#ffad78',
  brandOrangeMid: '#ff8c43',
  brandOrangeDark: '#ff5200',
  brandYellowLight: '#ffd6ba',
  brandYellowMid: '#ffc962',
  brandYellowDark: '#d49815',
  secondary: '#52c41a',
  link: '#0449dd',
};

export const themeTokens = {
  colors,
  borderRadius: {
    base: 8,
    lg: 12,
    sm: 6,
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamilyBase:
      "Roboto, 'TT Firs Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    fontSizeBase: 16,
    fontSizeSm: 14,
    fontSizeLg: 18,
    fontSizeXl: 20,
    headings: {
      h1: 32,
      h2: 24,
      h3: 20,
      h4: 18,
      h5: 16,
    },
    lineHeights: {
      base: 1.5,
      tight: 1.35,
    },
  },
  contentBackground: 'linear-gradient(-45deg, var(--brand-white), #f3f3f6 30%)',
};

export const antdThemeTokens = {
  colorPrimary: colors.brandOrange,
  colorBgBase: colors.brandWhite,
  colorBorder: '#D9D9D9',
  colorLink: colors.link,
  colorText: colors.brandBlack,
  borderRadius: themeTokens.borderRadius.base,
};
