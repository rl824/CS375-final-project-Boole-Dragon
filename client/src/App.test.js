import { render, screen } from '@testing-library/react';
import App from './App';

test('renders deal finder heading', () => {
  render(<App />);
  const heading = screen.getByText(/Deal Finder/i);
  expect(heading).toBeInTheDocument();
});
