import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "M-Shop - Online Shopping",
    description: "Best online shop in Africa",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AuthProvider from "@/components/AuthProvider";
import { ShopProvider } from "@/context/ShopContext";

import Footer from "@/components/Footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning={true}>
                <AuthProvider>
                    <ShopProvider>
                        <Header />
                        {children}
                        <Footer />
                        <BottomNav />
                    </ShopProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
