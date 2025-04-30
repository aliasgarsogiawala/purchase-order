# Purchase Order Generator

## Overview
The Purchase Order Generator is a React-based web application that allows users to create, customize, and generate professional purchase orders in PDF format. This tool streamlines the procurement process by providing an intuitive interface for creating detailed purchase orders with customizable fields.

## Features
- Create purchase orders with detailed item information
- Add multiple items with quantity, unit of measurement, and pricing
- Calculate taxes (CGST/SGST or IGST) automatically
- Save To Address and choose from pre saved addresses
- GST Nuber and address linkage . Directly will link address to GST number.
- Customize transport and delivery details
- Generate professional PDF documents
- Save and print purchase orders

## Transport Details Customization
The application allows you to customize the following transport-related fields:

- **Delivery Timing**: Specify when the delivery should occur (default: "Immediate")
- **Mode of Transport**: Indicate how goods will be transported (default: "By Road")
- **Payment Terms**: Define payment conditions (default: "45 days PDC")
- **Freight Charges**: Specify who bears the freight charges (default: "Ex – Bhiwandi")
- **Transport Name**: Enter the transport service provider details (default: "Bhosale Tempo Service Shirwal Branch Godown delivery")

## Customization Instructions

### Updating Company Address
To update the company address that appears in the PDF footer:

1. Open the `PdfGenerator.js` file
2. Locate the footer section (around line 200)
3. Replace the placeholder address with your company's address

```javascript
// Footer with company details and page number
const footerY = termsStartY + termsBoxHeight + 5; 
doc.setFontSize(6); 
doc.text('Your Company Name', startX + 70, footerY);
doc.text('Your Complete Address, City, State, PIN', startX + 60, footerY + 3);
doc.text('Page 1/1', startX + 160, footerY);
```

### Updating Company Logo
To update the company logo:

1. Prepare your logo image (recommended format: PNG with transparent background)
2. Name your logo file `stc.png`
3. Place the file in the `/public` folder of your project, replacing the existing logo
4. If you want to use a different filename:
   - Open `PdfGenerator.js`
   - Find the `useEffect` hook that loads the logo
   - Update the image source path to match your filename

```javascript
useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";  
    img.onload = () => {
        setLogoImg(img);
    };
    img.onerror = (err) => {
        console.error("Error loading logo:", err);
    };
    // Update the filename here if needed
    img.src = process.env.PUBLIC_URL + '/your-logo-filename.png';
}, []);
```

## Getting Started

### Prerequisites
- Node.js and npm installed on your system

### Installation

1. Clone the repository  
2. Navigate to the project directory  
3. Install dependencies:

```bash
npm install
```

### Running the Application

```bash
npm start
```

This will start the development server and open the application in your default browser at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Technologies Used
- React.js
- jsPDF for PDF generation
- CSS for styling

## License
This project is open source and available under the MIT License.
