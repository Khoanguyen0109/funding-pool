import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { router } from '@/routes';
import theme from '@/styles/theme';
import { LocaleProvider } from '@/context/LocaleContext';

export default function App() {
  return (
    <Provider store={store}>
      <LocaleProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </LocaleProvider>
    </Provider>
  );
}
