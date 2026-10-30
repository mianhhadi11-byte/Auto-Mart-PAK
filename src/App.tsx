import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Buy } from './pages/Buy';
import { CarDetail } from './pages/CarDetail';
import { Compare } from './pages/Compare';
import { Sell } from './pages/Sell';
import { Auth } from './pages/Auth';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Favorites } from './pages/Favorites';
import { MyListings } from './pages/MyListings';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="buy" element={<Buy />} />
            <Route path="cars/:slug" element={<CarDetail />} />
            <Route path="compare" element={<Compare />} />
            <Route path="sell" element={<Sell />} />
            <Route path="login" element={<Auth />} />
            <Route path="signup" element={<Auth />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
