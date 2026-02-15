import React from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

jest.mock('@/api/auth', () => ({
  refresh: jest.fn(),
}));
import { refresh } from '@/api/auth';

function ShowLocation() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname}</div>;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to /signin when no token', () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/signin" element={<ShowLocation />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/signin');
  });

  it('renders children when token exists', () => {
    localStorage.setItem('fm_token', 'token');

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div data-testid="secret">Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('secret')).toBeInTheDocument();
  });

  it('refreshes and renders children when only refresh token exists', async () => {
    localStorage.setItem('fm_refresh_token', 'refresh-only');
    (refresh as jest.Mock).mockResolvedValue({ access_token: 'new-access' });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div data-testid="secret">Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('secret')).toBeInTheDocument());
    expect(localStorage.getItem('fm_token')).toBe('new-access');
  });
});
