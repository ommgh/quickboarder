import { NextRequest, NextResponse } from "next/server";

const UPC_API_KEY = process.env.UPC_API_KEY;
const API_BASE_URL = "https://go-upc.com/api/v1/code/";

export const POST = async (req: NextRequest) => {
  try {
    const { barcodeNumber } = await req.json();
    if (!barcodeNumber) {
      return NextResponse.json(
        { error: "Barcode number is required" },
        { status: 400 },
      );
    }

    const reqURL = `${API_BASE_URL}${barcodeNumber}?key=${UPC_API_KEY}`;
    const response = await fetch(reqURL, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "UPC API request failed", status: response.status },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 },
    );
  }
};
