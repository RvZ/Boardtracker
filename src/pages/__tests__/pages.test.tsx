import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Dashboard from '../Dashboard';
import SeasonStats from '../SeasonStats';
import ResortMap from '../ResortMap';
import Import from '../Import';

function renderWithRouter(ui: React.ReactElement, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

describe('Page components', () => {
  it('Dashboard renders without crashing', () => {
    const { container } = renderWithRouter(<Dashboard />);
    expect(container).toBeTruthy();
  });

  it('Dashboard shows season name', () => {
    renderWithRouter(<Dashboard />);
    expect(screen.getByText(/2025\/2026/)).toBeInTheDocument();
  });

  it('SeasonStats renders without crashing', () => {
    const { container } = renderWithRouter(<SeasonStats />);
    expect(container).toBeTruthy();
  });

  it('ResortMap renders without crashing', () => {
    const { container } = renderWithRouter(<ResortMap />);
    expect(container).toBeTruthy();
  });

  it('Import renders without crashing', () => {
    const { container } = renderWithRouter(<Import />);
    expect(container).toBeTruthy();
  });

  it('Import shows upload instructions', () => {
    renderWithRouter(<Import />);
    expect(screen.getByText(/Import Data/)).toBeInTheDocument();
  });
});
