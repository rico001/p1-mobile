// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Models from './pages/Models';
import Printer from './pages/Printer';
import Layout from './Layout';

export default function App() {
  return (
    <Provider store={store}>
      <Routes>
        {/* Layout-Route: alles unter "/" verwendet das Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/models" replace />} />
          <Route path="models" element={<Models />} />
          <Route path="printer" element={<Printer />} />
          {/*<Route path="logbuch" element={<Logbuch />} />*/}
        </Route>
      </Routes>
    </Provider>
  );
}
