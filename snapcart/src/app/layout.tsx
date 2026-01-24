import type { Metadata } from "next";

import "./globals.css";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";

export const metadata: Metadata = {
  title: "snapcart | 10 min grocery delivery app",
  description: "A grocery delivery app that delivers groceries in 10 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-[200vh] bg-linear-to-b from-green-100 to-white">
        
          <Provider>
            <StoreProvider>
              <InitUser/>
            {children}
            </StoreProvider>
          </Provider>
        
      </body>
    </html>
  );
}
