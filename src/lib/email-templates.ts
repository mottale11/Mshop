export const generateOrderPlacedEmail = (order: any, items: any[]) => {
    const itemsList = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title || item.products?.title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity || item.qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">KSh ${(item.price).toLocaleString()}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #f68b1e;">Order Confirmation</h2>
            <p>Hi ${order.shipping_address.firstName},</p>
            <p>Thank you for your order! We have received it and are processing it now.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p><strong>Order Number:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${order.payment_method}</p>
                 <p><strong>Order Status:</strong> ${order.status}</p>
            </div>

            <h3>Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: left;">Qty</th>
                        <th style="padding: 10px; text-align: left;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                </tbody>
                <tfoot>
                     <tr>
                        <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                        <td style="padding: 10px; font-weight: bold;">KSh ${order.total_amount.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>

            <h3>Delivery Address</h3>
            <p>
                ${order.shipping_address.firstName} ${order.shipping_address.lastName}<br>
                ${order.shipping_address.address}<br>
                ${order.shipping_address.city}<br>
                Phone: ${order.shipping_address.phone}
            </p>

            <p style="margin-top: 30px; font-size: 0.9rem; color: #666;">
                Need help? Contact us at support@mshop.com
            </p>
        </div>
    `;
};

export const generateOrderStatusEmail = (order: any, status: string) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #f68b1e;">Order Update</h2>
            <p>Hi ${order.shipping_address?.firstName || 'Customer'},</p>
            <p>Your order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> has been updated.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
                <p style="font-size: 1.1rem; margin-bottom: 5px;">New Status:</p>
                <h3 style="color: #f68b1e; margin: 0; text-transform: uppercase;">${status}</h3>
            </div>

            <p>You can track your order in your <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}/account/orders">My Orders</a> section.</p>

            <p style="margin-top: 30px; font-size: 0.9rem; color: #666;">
                Thank you for shopping with M-Shop!
            </p>
        </div>
    `;
};
