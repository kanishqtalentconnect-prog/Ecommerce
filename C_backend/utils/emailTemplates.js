export const adminOrderPlacedTemplate = ({ order, products, owner }) => {
  return `
    <h2>🛒 New Order Received</h2>

    <p>Hello <strong>${owner.name}</strong>,</p>
    <p>You have received a new order for your product(s).</p>

    <hr />

    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Buyer:</strong> ${order.user.name} (${order.user.email})</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>

    <h3>Products Ordered:</h3>
    <ul>
      ${products
        .map(
          (p) =>
            `<li>
              ${p.product.name} × ${p.quantity} — ₹${p.price}
            </li>`
        )
        .join("")}
    </ul>

    <p><strong>Payment Status:</strong> PAID</p>

    <h3>Shipping Details:</h3>
    ${
      order.shippingDetails?.addressId
        ? `
          <p>
            ${order.shippingDetails.addressId.street},<br/>
            ${order.shippingDetails.addressId.city},
            ${order.shippingDetails.addressId.state} - 
            ${order.shippingDetails.addressId.zipcode}
          </p>
        `
        : "<p>Pickup Order</p>"
    }

    <hr />
    <p>Please process this order at the earliest.</p>
  `;
};

export const userOrderPlacedTemplate = (order) => {
  return `
    <h2>✅ Order Confirmed</h2>
    <p>Hi ${order.user.name},</p>
    <p>Your order has been placed successfully.</p>

    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Total Paid:</strong> ₹${order.totalAmount}</p>

    <h3>Items:</h3>
    <ul>
      ${order.products
        .map(
          (p) =>
            `<li>${p.product.name} × ${p.quantity} — ₹${p.price}</li>`
        )
        .join("")}
    </ul>

    <p>We will notify you when your order status changes.</p>
    <p>Thank you for shopping with us ❤️</p>
  `;
};
