import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BillingPage from '@/app/dashboard/billing/page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth context
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('BillingPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });
  
  test('redirects to login page if user is not authenticated', async () => {
    // Mock unauthenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });
    
    render(<BillingPage />);
    
    // Check if router.push was called with the login page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });
  
  test('displays loading spinner while checking authentication', () => {
    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });
    
    render(<BillingPage />);
    
    // Check if loading spinner is displayed
    const loadingSpinner = screen.getByTestId('loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
  });
  
  test('renders billing page content for authenticated users', () => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      loading: false,
    });
    
    render(<BillingPage />);
    
    // Check if billing page content is displayed
    const pageTitle = screen.getByText('Billing & Subscription');
    expect(pageTitle).toBeInTheDocument();
    
    // Check if subscription section is displayed
    const currentPlanHeading = screen.getByText('Current Plan');
    expect(currentPlanHeading).toBeInTheDocument();
    
    // Check if usage section is displayed
    const usageHeading = screen.getByText('Usage');
    expect(usageHeading).toBeInTheDocument();
    
    // Check if billing history section is displayed
    const billingHistoryHeading = screen.getByText('Billing History');
    expect(billingHistoryHeading).toBeInTheDocument();
    
    // Check if payment methods section is displayed
    const paymentMethodsHeading = screen.getByText('Payment Methods');
    expect(paymentMethodsHeading).toBeInTheDocument();
  });
}); 