import Script from "next/script";
import "../app/globals.css"; // Import Tailwind CSS

export const metadata = {
  title: "Trình nạp Firmware",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 flex flex-col min-h-screen">
        {children}
      <Script
    src="/scripts/install-button.js"
    strategy="afterInteractive" 
/>
      </body>
    </html>
  );
}
