# QuickBoarder Dashboard

QuickBoarder is an AI-powered dashboard that allows users to upload product images and automatically generate structured product data, including images, titles, and descriptions. Depending on the product type, different AI models and web scrapers are utilized to retrieve and refine product details. Users can review, edit, and export their product catalogue for use on e-commerce platforms.

## Features

- **AI-Powered Product Recognition**:
  - Detects and extracts product details from uploaded images.
  - Generates four AI-enhanced images, a title, and a description.
- **Barcode-Based Web Scraping**:
  - Fetches product images, title, and description from Amazon/Google using the barcode.
- **Product Editing**:
  - Users can select the best image from the generated options.
  - Edit product title and description.
  - Add a price field to any product.
- **Product Catalogue Management**:
  - Save products in a structured format.
  - Export catalogue for e-commerce integration.


## Installation & Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/ommgh/quickboarder.git
   cd QuickBoarder
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in `.env` file:
   ```sh
   NEXT_PUBLIC_API_KEY=your_api_key
   DATABASE_URL=your_database_url
   AI_MODEL_ENDPOINT=your_ai_model_endpoint
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```

## Usage

1. Upload a product image.
2. Select product type:
   - **Unorganised**: AI detects product and generates images, title, and description.
   - **Organised**: AI extracts barcode and fetches details via web scraping.
   - **Unique**: AI enchances the product image quality and presentation.
3. Review and edit product details.
4. Save product to the catalogue.
5. Export catalogue for e-commerce platforms.


