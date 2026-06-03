# Inventory & POS Management System

A full-stack, end-to-end Inventory and Point of Sale (POS) management system built with Spring Boot (Java) and React (Vite). It is designed specifically for physical retail stores to track stock, process sales rapidly with barcode scanners, and strictly manage user permissions.

---

## 🔒 Role-Based Access Control (RBAC)

The system relies on three distinct administrative roles to secure workflows.

### 1. `SUPER_ADMIN` (The Owner)
- **Scope**: Absolute control over the entire system.
- **Key Responsibilities**:
  - The only user authorized to approve or reject new user registrations.
  - Can view all inventory, sales, and user metrics.
  - Fully manages the system.
- **Workflow**: When a new employee registers, they remain `PENDING` and cannot log in until the Super Admin visits the **Approvals** dashboard and assigns them a role.

### 2. `INVENTORY_ADMIN` (The Manager)
- **Scope**: Complete control over the physical stock and product catalog.
- **Key Responsibilities**:
  - Add new products and define custom attributes (Color, Size, Brand).
  - Adjust stock levels when new shipments arrive.
  - Edit pricing and profit margins.
  - View historical sales data.
- **Restrictions**: Cannot access the User Approvals dashboard or approve users.

### 3. `POS_ADMIN` (The Cashier)
- **Scope**: Restricted exclusively to the Point of Sale system.
- **Key Responsibilities**:
  - Scan items using a physical barcode scanner to add them to the cart.
  - Process cash checkouts and generate invoices.
- **Restrictions**: Cannot view the Inventory table, cannot edit stock levels manually, cannot view sales history, and cannot access the User Approvals dashboard.

---

## 🔄 Core Workflows

### User Creation & Onboarding Workflow
1. **Registration**: A new employee visits the `/register` page and creates an account.
2. **Pending State**: The employee is locked out of the system (`ApprovalStatus = PENDING`).
3. **Approval**: The `SUPER_ADMIN` logs in, navigates to **User Approvals**, selects the appropriate role for the employee (e.g., `POS_ADMIN`), and clicks **Approve**.
4. **Active**: The employee can now log in and is automatically restricted to the views designated by their role.

### Inventory Management Workflow
1. **Adding Products**: The Manager clicks **Scan / Add Item**. They can scan a manufacturer barcode. If the barcode is new, the system opens a form to define the SKU, Cost, Profit Margin, and custom JSON attributes (e.g., Size, Color).
2. **Stock Adjustments**: When a new box of jackets arrives, the Manager clicks the **Adjust Stock** (package icon) on the inventory table, types `+50` (or `-10` for damages), and the system instantly updates the available stock.
3. **Pricing Calculations**: The system automatically calculates the final `Selling Price` based on the `Cost Price` + `Profit Margin %`.

### Point of Sale (Checkout) Workflow
1. **Hardware Scanning**: The system features a global keyboard-interception hook (`useBarcodeScanner`). The Cashier simply zaps a product with a physical USB/Bluetooth barcode scanner.
2. **Instant Cart Addition**: The system detects the hyper-fast keystrokes, looks up the barcode in the database via the API, and instantly drops the product into the cart.
3. **Validation**: The backend verifies that the requested quantity does not exceed the `currentStock`.
4. **Checkout**: The cashier clicks **Complete Checkout**. The backend logs the sale, generates a unique Invoice Number, deducts the exact quantities from the inventory, and clears the cart for the next customer.
