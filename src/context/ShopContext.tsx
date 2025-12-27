"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: any;
    title: string;
    price: number;
    image: string;
    qty: number;
}

interface ShopContextType {
    cart: CartItem[];
    wishlist: any[]; // IDs or objects
    addToCart: (product: any) => void;
    removeFromCart: (id: any) => void;
    updateQuantity: (id: any, qty: number) => void;
    toggleWishlist: (product: any) => void;
    isInWishlist: (id: any) => boolean;
    clearCart: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        const storedWishlist = localStorage.getItem("wishlist");
        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [
                ...prev,
                {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image_url || "", // Adapt as needed
                    qty: 1,
                },
            ];
        });
    };

    const removeFromCart = (id: any) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: any, qty: number) => {
        if (qty < 1) return;
        setCart((prev) =>
            prev.map((item) => (item.id === id ? { ...item, qty } : item))
        );
    };

    const toggleWishlist = (product: any) => {
        setWishlist((prev) => {
            const exists = prev.find((item) => item.id === product.id);
            if (exists) {
                return prev.filter((item) => item.id !== product.id);
            }
            return [...prev, product];
        });
    };

    const isInWishlist = (id: any) => {
        return wishlist.some((item) => item.id === id);
    };

    return (
        <ShopContext.Provider
            value={{
                cart,
                wishlist,
                addToCart,
                removeFromCart,
                updateQuantity,
                toggleWishlist,
                isInWishlist,
                clearCart: () => setCart([]),
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error("useShop must be used within a ShopProvider");
    }
    return context;
}
