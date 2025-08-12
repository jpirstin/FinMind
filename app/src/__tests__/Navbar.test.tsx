import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

const renderNav = () => render(
  <BrowserRouter>
    <Navbar />
  </BrowserRouter>
);

describe('Navbar auth state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows Sign In/Get Started when signed out', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
  });

  it('shows Account/Logout when signed in (token present)', () => {
    localStorage.setItem('fm_token', 'token');
    renderNav();
    expect(screen.getByRole('link', { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
