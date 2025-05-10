// src/App.jsx
import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import store from './store';
import Models from './pages/Models';
import Printer from './pages/Printer';
import AMS from './pages/AMS';
import Layout from './layout/Layout';
import { PAGES, setPage } from './store/uiSlice';

// Wrapper, der auf Location-Änderungen reagiert
function RouteChangeHandler() {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPage(location.pathname.replace(/^\//, '')));
  }, [location.pathname, dispatch]);

  return null;
}

export default function App() {
  return (
    <Provider store={store}>
        <RouteChangeHandler />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to={`/${PAGES.PRINTER}`} />} />
            <Route path={PAGES.MODELS} element={<Models />} />
            <Route path={PAGES.PRINTER} element={<Printer />} />
            <Route path={PAGES.AMS} element={<AMS />} />
            {/* <Route path="logbuch" element={<Logbuch />} /> */}
          </Route>
        </Routes>
    </Provider>
  );
}
