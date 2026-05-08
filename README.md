# Guestra: Hotel Occupancy Dashboard

Guestra is a React-based single-page hotel heatmap calendar application. It provides actionable insights into booking data, visualizes hotel occupancy using a dynamic heatmap, and allows users to explore availability and booking details through an intuitive drag-to-select interface.

## Project Structure

The codebase is organized in `src/` as follows:

*   **`App.tsx`**: The main entry point that ties the application together. It manages global state (selected dates, filters, tooltips) and handles the layout for the top navigation, calendar, and sidebar.
*   **`components/Calendar/`**:
    *   **`CalendarGrid.tsx`**: The core component that renders the 6-week calendar grid, manages the mouse drag selection state, and processes day-level events.
    *   **`DayCell.tsx`**: Renders an individual day block, including the heatmap background color, occupancy progress bar, active booking dots, and forwards mouse events for the drag feature.
    *   **`CalendarHeader.tsx`**: Provides controls for navigating between months and returning to "Today".
*   **`components/Sidebar/`**:
    *   **`StatsStrip.tsx`**: Displays monthly key performance indicators (Revenue, Avg. Occupancy, etc.).
    *   **`BookingPanel.tsx`**: Shows detailed booking and availability information for a selected date range.
*   **`components/FilterBar.tsx`**: Provides dropdowns to filter bookings by room type, status, and booking source.
*   **`components/Tooltip.tsx`**: A floating tooltip that displays occupancy details when hovering over a specific day.
*   **`utils/dateUtils.ts`**: A robust suite of pure utility functions. It contains all the math for date manipulation, calendar generation, overlap detection, occupancy calculation, and statistical aggregation.
*   **`hooks/useBookings.ts`**: A custom hook responsible for fetching and managing the `bookings.json` data.

## Calendar Grid and Calendar Days Logic

The calendar is designed to provide a consistent, non-jumping UI by always rendering a complete 6-week grid (exactly 42 cells). This logic is driven by the `getCalendarDays` function in `dateUtils.ts`:

1.  **Start of Month Calculation**: The logic determines the first day of the target month and finds its corresponding weekday index (where Sunday = 0).
2.  **Previous Month Padding**: Based on the weekday index, it calculates how many days from the end of the previous month are needed to fill the first row up to the 1st of the current month.
3.  **Current Month Generation**: It iterates from the 1st to the last day of the current month, adding them to the grid.
4.  **Next Month Padding**: Finally, it calculates the remaining empty slots `(42 - current_total_cells)` and fills them with the starting days of the next month.

The grid uses "Nights" logic for hotel stays: a booking occupies the nights from `checkIn` up to (but not including) `checkOut`. The `checkOut` day is considered free for a new guest to check in.

## Mouse Drag Feature

The application features a custom, native-event-driven drag-to-select functionality built into `CalendarGrid.tsx`, avoiding the need for heavy external drag-and-drop libraries.

The drag selection lifecycle:
1.  **`onMouseDown`**: When a user clicks a `DayCell`, the grid records that date as both `dragStart` and `dragEnd`, sets an `isDragging` flag, and temporarily clears any previously finalized selection.
2.  **`onMouseEnter`**: As the user drags the mouse across other `DayCell` components, the grid detects these hover events. If `isDragging` is true, it continuously updates the `dragEnd` date, allowing the UI to instantly recalculate and highlight the current selection range.
3.  **`onMouseUp`**: Releasing the mouse button triggers the end of the drag. The logic normalizes the start and end dates (ensuring the start date is always chronologically before or equal to the end date, regardless of whether the user dragged left-to-right or right-to-left). A finalized `SelectionRange` is created and propagated to the rest of the application via `onSelectionChange`.
4.  **Global Fallback**: A `mouseup` event listener is attached to the global `document`. This ensures that if a user starts dragging inside the calendar but releases the mouse button outside of it, the drag operation is still properly terminated and finalized.

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project directory:
    ```bash
    cd guestra
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Available Scripts

In the project directory, you can run:

*   **`npm run dev`**: Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.
*   **`npm run build`**: Builds the app for production to the `dist` folder.
*   **`npm run preview`**: Locally preview the production build.
*   **`npm run lint`**: Runs ESLint to check for code quality and style issues.
