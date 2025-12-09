# Kloudkart Database Schema

## Overview
This database schema manages products, categories, orders, and order items for the Kloudkart e-commerce application.

## Database Structure

### Tables

#### 1. Categories
Stores product categories.
- **CategoryId** (PK, Identity): Unique category identifier
- **CategoryName**: Name of the category (unique)
- **Description**: Category description
- **IsActive**: Soft delete flag
- **CreatedDate**: Record creation timestamp
- **ModifiedDate**: Last modification timestamp

#### 2. Products
Stores product information.
- **ProductId** (PK, Identity): Unique product identifier
- **ProductName**: Name of the product
- **CategoryId** (FK): Reference to Categories table
- **Description**: Product description
- **Price**: Product price (decimal 18,2)
- **StockQuantity**: Available quantity in stock
- **InStock**: Boolean flag for stock availability
- **ImageUrl**: URL to product image
- **IsActive**: Soft delete flag
- **CreatedDate**: Record creation timestamp
- **ModifiedDate**: Last modification timestamp

#### 3. Orders
Stores customer order information.
- **OrderId** (PK, Identity): Unique order identifier
- **OrderNumber**: Unique order number (format: ORD-YYYYMMDD-00001)
- **CustomerName**: Customer's full name
- **CustomerEmail**: Customer's email address
- **ShippingAddress**: Delivery address
- **City**: Delivery city
- **ZipCode**: Postal code
- **OrderTotal**: Total order amount
- **OrderStatus**: Order status (Pending, Processing, Shipped, Delivered, Cancelled)
- **OrderDate**: Order creation date
- **ShippedDate**: Shipment date
- **DeliveredDate**: Delivery date
- **CreatedDate**: Record creation timestamp
- **ModifiedDate**: Last modification timestamp

#### 4. OrderItems
Stores individual items within orders.
- **OrderItemId** (PK, Identity): Unique order item identifier
- **OrderId** (FK): Reference to Orders table
- **ProductId** (FK): Reference to Products table
- **ProductName**: Product name (denormalized for historical data)
- **Quantity**: Quantity ordered
- **UnitPrice**: Price per unit at time of order
- **Subtotal** (Computed): Quantity × UnitPrice
- **CreatedDate**: Record creation timestamp

### Indexes
Performance indexes created on:
- Products: CategoryId, IsActive, InStock
- Orders: OrderDate, OrderStatus, CustomerEmail
- OrderItems: OrderId, ProductId

## Stored Procedures

### Product Management
1. **sp_GetAllProducts** - Retrieve all active products with optional filtering
   - Parameters: @CategoryId (optional), @InStockOnly (optional)
   
2. **sp_GetProductById** - Get product details by ID
   - Parameters: @ProductId
   
3. **sp_AddProduct** - Add new product
   - Parameters: @ProductName, @CategoryId, @Description, @Price, @StockQuantity, @InStock, @ImageUrl
   - Returns: @ProductId (OUTPUT)
   
4. **sp_UpdateProduct** - Update existing product
   - Parameters: @ProductId, @ProductName, @CategoryId, @Description, @Price, @StockQuantity, @InStock, @ImageUrl
   
5. **sp_DeleteProduct** - Soft delete product
   - Parameters: @ProductId

### Order Management
6. **sp_CreateOrder** - Create new order
   - Parameters: @CustomerName, @CustomerEmail, @ShippingAddress, @City, @ZipCode, @OrderTotal
   - Returns: @OrderId (OUTPUT), OrderNumber
   
7. **sp_AddOrderItem** - Add item to order and update stock
   - Parameters: @OrderId, @ProductId, @Quantity
   
8. **sp_GetOrderDetails** - Get complete order information
   - Parameters: @OrderId
   - Returns: Order header and order items
   
9. **sp_GetOrdersByCustomer** - Get all orders for a customer
   - Parameters: @CustomerEmail
   
10. **sp_UpdateOrderStatus** - Update order status
    - Parameters: @OrderId, @OrderStatus

## Views

### 1. vw_ProductInventorySummary
Provides inventory summary by category:
- CategoryName
- TotalProducts
- InStockProducts
- TotalStockQuantity
- AvailableStock
- AveragePrice

### 2. vw_OrderSummary
Provides order summary information:
- OrderId, OrderNumber
- Customer information
- Order totals
- Item counts

## Setup Instructions

### 1. Create Database
```sql
-- Run the Schema.sql script in SQL Server Management Studio
-- or execute via command line:
sqlcmd -S localhost -i Schema.sql
```

### 2. Configure Connection String
Update Web.config with your SQL Server connection string:

```xml
<connectionStrings>
  <add name="KloudkartDB" 
       connectionString="Server=localhost;Database=KloudkartDB;Integrated Security=true;" 
       providerName="System.Data.SqlClient" />
</connectionStrings>
```

### 3. Test Connection
```sql
-- Verify tables and data
SELECT * FROM vw_ProductInventorySummary;
SELECT * FROM dbo.Products;
```

## Sample Data
The schema includes sample data:
- 5 Categories (Electronics, Furniture, Clothing, Books, Sports)
- 8 Products across different categories
- 0 Orders (ready for application to create)

## Usage Examples

### Get all products in Electronics category
```sql
EXEC sp_GetAllProducts @CategoryId = 1, @InStockOnly = 1;
```

### Create an order
```sql
DECLARE @OrderId INT;
EXEC sp_CreateOrder 
    @CustomerName = 'John Doe',
    @CustomerEmail = 'john@example.com',
    @ShippingAddress = '123 Main St',
    @City = 'Seattle',
    @ZipCode = '98101',
    @OrderTotal = 1099.98,
    @OrderId = @OrderId OUTPUT;

-- Add items to order
EXEC sp_AddOrderItem @OrderId = @OrderId, @ProductId = 1, @Quantity = 1;
EXEC sp_AddOrderItem @OrderId = @OrderId, @ProductId = 2, @Quantity = 2;
```

### Get order details
```sql
EXEC sp_GetOrderDetails @OrderId = 1;
```

### Update order status
```sql
EXEC sp_UpdateOrderStatus @OrderId = 1, @OrderStatus = 'Shipped';
```

## Security Considerations
1. Create dedicated database user for the application
2. Grant only necessary permissions (EXECUTE on stored procedures)
3. Use parameterized queries to prevent SQL injection
4. Enable encryption for sensitive data in production
5. Regular backups of the database

## Migration from In-Memory to Database
To integrate with the existing application:
1. Install Entity Framework or ADO.NET
2. Update Controllers to use stored procedures
3. Replace static lists with database calls
4. Add connection string to Web.config
5. Test all CRUD operations

## Maintenance
- Regular index maintenance and statistics updates
- Monitor query performance
- Archive old orders periodically
- Clean up soft-deleted products
