# Real-Time Expense Tracker Dashboard

A comprehensive web application for tracking personal expenses with real-time synchronization across multiple browser tabs, interactive visualizations, and financial insights.

![Expense Tracker Dashboard](https://via.placeholder.com/800x450.png?text=Expense+Tracker+Dashboard)

## Features

### User Profile Management
- **Personal Information**: Set and update your name and monthly salary
- **Financial Overview**: View your remaining balance and monthly savings at a glance
- **Persistent Storage**: User profile data is saved between sessions

### Expense Tracking
- **Easy Input**: Add expenses with amount, category, date, and optional description
- **Categorization**: Organize expenses into predefined categories
- **Date Tracking**: Record when each expense occurred

### Visualization
- **Category Breakdown**: Interactive pie chart showing spending distribution by category
- **Spending Trends**: Line chart displaying expense patterns over time
- **Summary Statistics**: Quick view of total, weekly, and daily expenses

### Advanced Filtering
- **Time-Based Filters**: Filter by today, this week, this month, or custom date range
- **Category Filters**: Focus on specific expense categories
- **Combination Filters**: Apply multiple filters simultaneously for detailed analysis

### Real-Time Synchronization
- **Multi-Tab Support**: Changes made in one tab instantly appear in all open tabs
- **No Server Required**: Uses BroadcastChannel API for client-side synchronization
- **Immediate Updates**: See changes to expenses and profile data in real-time

### User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive Notifications**: Get feedback when actions are completed
- **Intuitive Interface**: Clean, modern design for easy navigation

## Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Styling with custom properties for theming
- **JavaScript (ES6+)**: Core application logic
- **Chart.js**: Interactive data visualization
- **BroadcastChannel API**: Real-time synchronization across tabs
- **localStorage API**: Persistent data storage
- **Font Awesome**: Icons and visual elements

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- No server or installation required

### Installation
1. Clone this repository or download the ZIP file
```bash
git clone https://github.com/yourusername/expense-tracker.git
```

2. Open the `index.html` file in your web browser
```bash
cd expense-tracker
open index.html  # On macOS
# OR
start index.html  # On Windows
```

### First-Time Setup
1. When you first open the application, you'll be prompted to enter your name and monthly salary
2. Fill in the required information and click "Save Profile"
3. Your profile will be saved for future sessions

## Usage Guide

### Adding Expenses
1. Fill out the "Add New Expense" form with:
   - Amount
   - Category
   - Date
   - Optional description
2. Click "Add Expense" to save

### Viewing Expenses
- All expenses are displayed in the "Recent Expenses" table
- Summary statistics show total, weekly, and daily spending
- Charts automatically update to reflect your spending patterns

### Filtering Data
1. Select a time period from the dropdown (All Time, Today, This Week, This Month, or Custom Range)
2. If using Custom Range, specify start and end dates
3. Select a category to filter by (or "All Categories")
4. Click "Apply Filters" to update the view

### Managing Your Profile
1. View your profile information in the "User Profile" section
2. Click "Edit Profile" to update your name or monthly salary
3. Your remaining balance and monthly savings are automatically calculated

### Using Dark Mode
- Toggle the sun/moon switch in the header to change between light and dark themes
- Your preference is saved for future sessions

## Data Privacy

All data is stored locally on your device using the browser's localStorage API. No information is sent to any server or third party.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 15.4+
- Edge 79+

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Chart.js for the visualization library
- Font Awesome for the icons
- All contributors and testers who helped improve this application

---

## Development Notes

### Project Structure
```
expense-tracker/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # Documentation
```

### Future Enhancements
- Export data to CSV/PDF
- Budget setting and alerts
- Income tracking
- Multiple currency support
- Data backup and restore
- Recurring expense automation

---

Created with ❤️ by [Your Name]