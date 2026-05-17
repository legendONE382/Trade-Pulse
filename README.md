# TradePulse

**The simple money-tracking app for small businesses that sell fast and collect money faster.**

TradePulse is a WhatsApp-first business management app built for small sellers, side hustlers, shop owners, agents, and freelancers who need an easy way to track money without using complicated accounting software.

## Features

### Core MVP
- **Sales Tracking** - Record sales in seconds with customer details
- **Expense Tracking** - Log and categorize business expenses
- **Customer Management** - Store customer names, phone numbers, and notes
- **Debt/Credit Tracking** - Track who owes money and mark repayments
- **Invoice Generator** - Create and download simple invoices
- **Reminder System** - Set payment reminders and follow-ups
- **Profit Dashboard** - View daily, weekly, and monthly summaries

### Premium Features
- **WhatsApp Sharing** - Share invoices and reminders directly via WhatsApp
- **Product/Inventory Tracking** - Manage products with barcodes, stock levels, and low stock alerts

## Deployment

### PWA Installation (Recommended)

TradePulse is a Progressive Web App (PWA) that can be installed on your device for a native app-like experience:

#### One-Click Installation

1. **Open TradePulse in your browser**
   - Navigate to your TradePulse URL (e.g., https://trade-pulse.vercel.app)
   - Use Chrome, Edge, or Safari on mobile or desktop

2. **Look for the install button**
   - When the browser detects the app is installable, an "Install App" button will appear in the header
   - Click the button to install TradePulse

3. **Install the app**
   - Follow the browser's installation prompt
   - TradePulse will be added to your home screen (mobile) or applications (desktop)
   - Launch it anytime like a native app!

#### Manual Installation

If the install button doesn't appear automatically:

- **Chrome/Edge**: Click the install icon in the address bar (📱 or ⬇️)
- **Safari (iOS)**: Tap Share → Add to Home Screen
- **Safari (Mac)**: Click Share → Add to Dock

### Chrome Extension Installation

TradePulse can also be installed as a Chrome extension for quick access:

#### Easy Installation (Recommended)

1. **Download the extension**
   - Go to [GitHub Releases](https://github.com/legendONE382/Trade-Pulse/releases)
   - Download the latest `tradepulse-extension-*.zip` file
   - Extract the zip file to a folder on your computer

2. **Install in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extracted folder
   - TradePulse will appear in your extensions!

#### Developer Installation

If you want to build the extension yourself:

1. **Build the extension**
   ```bash
   npm run build:extension
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from your project
   - TradePulse will appear in your extensions!

3. **Package for distribution**
   ```bash
   npm run package:extension
   ```
   This creates a zip file in the `releases/` folder that can be shared with others.

### Vercel Deployment (Recommended)

1. **Push to GitHub** (already done)
   - Repository: https://github.com/legendONE382/Trade-Pulse

2. **Deploy to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the `Trade-Pulse` repository
   - Vercel will auto-detect the Vite configuration
   - Click "Deploy"
   - Your app will be live in seconds!

3. **Access Your App**
   - Vercel will provide a URL like `https://trade-pulse.vercel.app`
   - Share this URL with users to access the app

### Manual Deployment

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory, which can be hosted on any static hosting service.

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/legendONE382/Trade-Pulse.git
cd Trade-Pulse
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Dashboard
The dashboard provides an overview of your business performance:
- Total sales and expenses
- Net profit calculation
- Customer count
- Pending debts
- Today's sales
- Recent sales and expenses

### Sales
- Add new sales with description, amount, customer, and date
- Edit or delete existing sales
- View all sales in a table format
- Sales are linked to customers for better tracking

### Expenses
- Record business expenses with categories
- Categorize expenses (Inventory, Rent, Utilities, etc.)
- Track expense dates and amounts
- Edit or delete expenses as needed

### Customers
- Add customers with name, phone, email, and notes
- Manage customer database
- Customers are linked to sales, debts, and invoices

### Debts
- Track customer debts and credits
- Set due dates for debts
- Mark debts as paid when collected
- View pending and paid debts separately

### Invoices
- Create professional invoices for customers
- Add multiple line items with quantities and prices
- Download invoices as text files
- **Share invoices via WhatsApp** with one click
- Track invoice totals and due dates

### Reminders
- Set reminders for payment follow-ups
- Link reminders to specific customers
- Mark reminders as complete
- **Share reminders via WhatsApp** with one click
- View overdue and today's reminders

### Products & Inventory
- Manage product catalog with barcodes and SKUs
- Track stock levels in real-time
- Set minimum stock alerts
- Quick stock adjustment buttons (+/-)
- View total stock value
- Low stock warnings

## Data Storage

TradePulse uses localStorage for data persistence. All your data is stored locally in your browser, ensuring:
- Fast access to your data
- No internet connection required
- Privacy - your data stays on your device

**Note:** Since data is stored locally, clearing your browser data will remove all TradePulse data. Consider exporting important records regularly.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **Supabase** - Authentication & Database
- **Chrome Extension API** - Browser extension support

## Browser Compatibility

TradePulse is designed to work across all modern browsers:
- **Chrome/Edge** (recommended) - Full support including Chrome extension
- **Firefox** - Full support for web app
- **Safari** - Full support including iOS Safari
- **Mobile Browsers** - Optimized for mobile devices with responsive design

The app uses standard web APIs and polyfills for maximum compatibility.

## Future Upgrades

Planned features for future versions:
- Team access for shop workers
- Simple receipts
- Offline mode with sync
- Cloud backup
- Payment links
- AI profit insights

## Business Model

Start free with basic tracking, then charge for premium features:
- Invoice branding
- Cloud backups
- Advanced reports
- Multi-user access
- Automated reminders

## Best For

- Online sellers
- POS agents
- Provision shops
- Food vendors
- Freelancers
- Barbers and salons
- Small traders
- Repair workers
- Local service providers

## Mobile Optimization

TradePulse is fully optimized for mobile devices:
- **Responsive Design** - All pages adapt to different screen sizes
- **Touch-Friendly Interface** - Large buttons and touch targets
- **Mobile Navigation** - Hamburger menu for easy navigation on phones
- **Performance** - Optimized for fast loading on mobile networks
- **PWA Support** - Can be installed as a progressive web app on mobile devices

## License

This project is proprietary software.

## Support

For issues or questions, please contact the TradePulse team.

---

**Live Demo:** Deployed on Vercel - Access via the provided Vercel URL after deployment
