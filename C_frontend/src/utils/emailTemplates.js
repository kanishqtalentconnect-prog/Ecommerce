export const adminOrderPlacedTemplate = (order) => `
  <h2>🛒 New Order Placed</h2>
  <p><b>Order ID:</b> ${order._id}</p>
  <p><b>User:</b> ${order.user.name} (${order.user.email})</p>
  <p><b>Total:</b> ₹${order.totalAmount}</p>
  <p><b>Status:</b> ${order.status}</p>

  <h3>Products</h3>
  <ul>
    ${order.products.map(p => `
      <li>
        ${p.product.name} × ${p.quantity} — ₹${p.price}
      </li>
    `).join("")}
  </ul>
`;

export const userOrderPlacedTemplate = (order) => `
  <h2>✅ Order Placed Successfully</h2>
  <p>Your order <b>${order._id}</b> has been placed.</p>
  <p>Total: ₹${order.totalAmount}</p>
  <p>Status: ${order.status}</p>
`;

export const orderStatusUpdatedTemplate = (order) => `
  <h2>📦 Order Status Updated</h2>
  <p>Your order <b>${order._id}</b> status is now:</p>
  <h3>${order.status.toUpperCase()}</h3>
`;
