-- Kloudkart E-Commerce Database Schema
-- Created: December 9, 2025

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'KloudkartDB')
BEGIN
    CREATE DATABASE KloudkartDB;
END
GO

USE KloudkartDB;
GO

-- Drop tables if they exist (for clean recreation)
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
GO

-- Categories Table
CREATE TABLE dbo.Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModifiedDate DATETIME2 NULL
);
GO

-- Products Table
CREATE TABLE dbo.Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(200) NOT NULL,
    CategoryId INT NOT NULL,
    Description NVARCHAR(1000) NULL,
    Price DECIMAL(18,2) NOT NULL CHECK (Price >= 0),
    StockQuantity INT NOT NULL DEFAULT 0 CHECK (StockQuantity >= 0),
    InStock BIT NOT NULL DEFAULT 1,
    ImageUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModifiedDate DATETIME2 NULL,
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) 
        REFERENCES dbo.Categories(CategoryId)
);
GO

-- Orders Table
CREATE TABLE dbo.Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(50) NOT NULL UNIQUE,
    CustomerName NVARCHAR(200) NOT NULL,
    CustomerEmail NVARCHAR(200) NOT NULL,
    ShippingAddress NVARCHAR(500) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    ZipCode NVARCHAR(20) NOT NULL,
    OrderTotal DECIMAL(18,2) NOT NULL CHECK (OrderTotal >= 0),
    OrderStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    OrderDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ShippedDate DATETIME2 NULL,
    DeliveredDate DATETIME2 NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModifiedDate DATETIME2 NULL
);
GO

-- OrderItems Table (Order Details)
CREATE TABLE dbo.OrderItems (
    OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    ProductName NVARCHAR(200) NOT NULL, -- Denormalized for historical data
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(18,2) NOT NULL CHECK (UnitPrice >= 0),
    Subtotal AS (Quantity * UnitPrice) PERSISTED,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) 
        REFERENCES dbo.Orders(OrderId) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId) 
        REFERENCES dbo.Products(ProductId)
);
GO

-- Create Indexes for Performance
CREATE NONCLUSTERED INDEX IX_Products_CategoryId ON dbo.Products(CategoryId);
CREATE NONCLUSTERED INDEX IX_Products_IsActive ON dbo.Products(IsActive);
CREATE NONCLUSTERED INDEX IX_Products_InStock ON dbo.Products(InStock);
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate ON dbo.Orders(OrderDate DESC);
CREATE NONCLUSTERED INDEX IX_Orders_OrderStatus ON dbo.Orders(OrderStatus);
CREATE NONCLUSTERED INDEX IX_Orders_CustomerEmail ON dbo.Orders(CustomerEmail);
CREATE NONCLUSTERED INDEX IX_OrderItems_OrderId ON dbo.OrderItems(OrderId);
CREATE NONCLUSTERED INDEX IX_OrderItems_ProductId ON dbo.OrderItems(ProductId);
GO

-- Insert Sample Categories
INSERT INTO dbo.Categories (CategoryName, Description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Furniture', 'Home and office furniture'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Books and educational materials'),
('Sports', 'Sports equipment and accessories');
GO

-- Insert Sample Products
DECLARE @ElectronicsId INT = (SELECT CategoryId FROM dbo.Categories WHERE CategoryName = 'Electronics');
DECLARE @FurnitureId INT = (SELECT CategoryId FROM dbo.Categories WHERE CategoryName = 'Furniture');

INSERT INTO dbo.Products (ProductName, CategoryId, Description, Price, StockQuantity, InStock) VALUES
('Laptop', @ElectronicsId, 'High-performance laptop for work and gaming', 999.99, 50, 1),
('Mouse', @ElectronicsId, 'Wireless ergonomic mouse', 29.99, 150, 1),
('Keyboard', @ElectronicsId, 'Mechanical keyboard with RGB lighting', 79.99, 100, 1),
('Monitor', @ElectronicsId, '27-inch 4K UHD monitor', 299.99, 0, 0),
('Desk', @FurnitureId, 'Adjustable standing desk', 399.99, 25, 1),
('Office Chair', @FurnitureId, 'Ergonomic office chair with lumbar support', 249.99, 40, 1),
('Headphones', @ElectronicsId, 'Noise-cancelling wireless headphones', 199.99, 75, 1),
('Webcam', @ElectronicsId, '1080p HD webcam for video calls', 89.99, 60, 1);
GO

-- Stored Procedure: Get All Products
CREATE OR ALTER PROCEDURE sp_GetAllProducts
    @CategoryId INT = NULL,
    @InStockOnly BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.ProductId,
        p.ProductName,
        p.Description,
        p.Price,
        p.StockQuantity,
        p.InStock,
        p.ImageUrl,
        c.CategoryName,
        p.CreatedDate
    FROM dbo.Products p
    INNER JOIN dbo.Categories c ON p.CategoryId = c.CategoryId
    WHERE p.IsActive = 1
        AND (@CategoryId IS NULL OR p.CategoryId = @CategoryId)
        AND (@InStockOnly = 0 OR p.InStock = 1)
    ORDER BY p.ProductName;
END
GO

-- Stored Procedure: Get Product by ID
CREATE OR ALTER PROCEDURE sp_GetProductById
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.ProductId,
        p.ProductName,
        p.Description,
        p.Price,
        p.StockQuantity,
        p.InStock,
        p.ImageUrl,
        c.CategoryId,
        c.CategoryName
    FROM dbo.Products p
    INNER JOIN dbo.Categories c ON p.CategoryId = c.CategoryId
    WHERE p.ProductId = @ProductId AND p.IsActive = 1;
END
GO

-- Stored Procedure: Add Product
CREATE OR ALTER PROCEDURE sp_AddProduct
    @ProductName NVARCHAR(200),
    @CategoryId INT,
    @Description NVARCHAR(1000) = NULL,
    @Price DECIMAL(18,2),
    @StockQuantity INT = 0,
    @InStock BIT = 1,
    @ImageUrl NVARCHAR(500) = NULL,
    @ProductId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO dbo.Products (ProductName, CategoryId, Description, Price, StockQuantity, InStock, ImageUrl)
    VALUES (@ProductName, @CategoryId, @Description, @Price, @StockQuantity, @InStock, @ImageUrl);
    
    SET @ProductId = SCOPE_IDENTITY();
    
    SELECT @ProductId AS ProductId;
END
GO

-- Stored Procedure: Update Product
CREATE OR ALTER PROCEDURE sp_UpdateProduct
    @ProductId INT,
    @ProductName NVARCHAR(200),
    @CategoryId INT,
    @Description NVARCHAR(1000) = NULL,
    @Price DECIMAL(18,2),
    @StockQuantity INT,
    @InStock BIT,
    @ImageUrl NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Products
    SET ProductName = @ProductName,
        CategoryId = @CategoryId,
        Description = @Description,
        Price = @Price,
        StockQuantity = @StockQuantity,
        InStock = @InStock,
        ImageUrl = @ImageUrl,
        ModifiedDate = GETDATE()
    WHERE ProductId = @ProductId AND IsActive = 1;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Stored Procedure: Delete Product (Soft Delete)
CREATE OR ALTER PROCEDURE sp_DeleteProduct
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Products
    SET IsActive = 0,
        ModifiedDate = GETDATE()
    WHERE ProductId = @ProductId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Stored Procedure: Create Order
CREATE OR ALTER PROCEDURE sp_CreateOrder
    @CustomerName NVARCHAR(200),
    @CustomerEmail NVARCHAR(200),
    @ShippingAddress NVARCHAR(500),
    @City NVARCHAR(100),
    @ZipCode NVARCHAR(20),
    @OrderTotal DECIMAL(18,2),
    @OrderId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Generate unique order number
        DECLARE @OrderNumber NVARCHAR(50) = 'ORD-' + FORMAT(GETDATE(), 'yyyyMMdd') + '-' + 
                                           RIGHT('00000' + CAST(ISNULL((SELECT MAX(OrderId) FROM dbo.Orders), 0) + 1 AS NVARCHAR), 5);
        
        INSERT INTO dbo.Orders (OrderNumber, CustomerName, CustomerEmail, ShippingAddress, City, ZipCode, OrderTotal, OrderStatus)
        VALUES (@OrderNumber, @CustomerName, @CustomerEmail, @ShippingAddress, @City, @ZipCode, @OrderTotal, 'Pending');
        
        SET @OrderId = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        SELECT @OrderId AS OrderId, @OrderNumber AS OrderNumber;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Add Order Item
CREATE OR ALTER PROCEDURE sp_AddOrderItem
    @OrderId INT,
    @ProductId INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DECLARE @ProductName NVARCHAR(200);
        DECLARE @UnitPrice DECIMAL(18,2);
        
        -- Get product details
        SELECT @ProductName = ProductName, @UnitPrice = Price
        FROM dbo.Products
        WHERE ProductId = @ProductId;
        
        -- Insert order item
        INSERT INTO dbo.OrderItems (OrderId, ProductId, ProductName, Quantity, UnitPrice)
        VALUES (@OrderId, @ProductId, @ProductName, @Quantity, @UnitPrice);
        
        -- Update product stock
        UPDATE dbo.Products
        SET StockQuantity = StockQuantity - @Quantity,
            InStock = CASE WHEN (StockQuantity - @Quantity) > 0 THEN 1 ELSE 0 END
        WHERE ProductId = @ProductId;
        
        COMMIT TRANSACTION;
        SELECT SCOPE_IDENTITY() AS OrderItemId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Get Order Details
CREATE OR ALTER PROCEDURE sp_GetOrderDetails
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Order Header
    SELECT 
        OrderId,
        OrderNumber,
        CustomerName,
        CustomerEmail,
        ShippingAddress,
        City,
        ZipCode,
        OrderTotal,
        OrderStatus,
        OrderDate,
        ShippedDate,
        DeliveredDate
    FROM dbo.Orders
    WHERE OrderId = @OrderId;
    
    -- Order Items
    SELECT 
        oi.OrderItemId,
        oi.ProductId,
        oi.ProductName,
        oi.Quantity,
        oi.UnitPrice,
        oi.Subtotal
    FROM dbo.OrderItems oi
    WHERE oi.OrderId = @OrderId;
END
GO

-- Stored Procedure: Get Orders by Customer Email
CREATE OR ALTER PROCEDURE sp_GetOrdersByCustomer
    @CustomerEmail NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        OrderId,
        OrderNumber,
        CustomerName,
        OrderTotal,
        OrderStatus,
        OrderDate
    FROM dbo.Orders
    WHERE CustomerEmail = @CustomerEmail
    ORDER BY OrderDate DESC;
END
GO

-- Stored Procedure: Update Order Status
CREATE OR ALTER PROCEDURE sp_UpdateOrderStatus
    @OrderId INT,
    @OrderStatus NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Orders
    SET OrderStatus = @OrderStatus,
        ShippedDate = CASE WHEN @OrderStatus = 'Shipped' THEN GETDATE() ELSE ShippedDate END,
        DeliveredDate = CASE WHEN @OrderStatus = 'Delivered' THEN GETDATE() ELSE DeliveredDate END,
        ModifiedDate = GETDATE()
    WHERE OrderId = @OrderId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- View: Product Inventory Summary
CREATE OR ALTER VIEW vw_ProductInventorySummary
AS
SELECT 
    c.CategoryName,
    COUNT(p.ProductId) AS TotalProducts,
    SUM(CASE WHEN p.InStock = 1 THEN 1 ELSE 0 END) AS InStockProducts,
    SUM(p.StockQuantity) AS TotalStockQuantity,
    SUM(CASE WHEN p.InStock = 1 THEN p.StockQuantity ELSE 0 END) AS AvailableStock,
    AVG(p.Price) AS AveragePrice
FROM dbo.Products p
INNER JOIN dbo.Categories c ON p.CategoryId = c.CategoryId
WHERE p.IsActive = 1
GROUP BY c.CategoryName;
GO

-- View: Order Summary
CREATE OR ALTER VIEW vw_OrderSummary
AS
SELECT 
    o.OrderId,
    o.OrderNumber,
    o.CustomerName,
    o.CustomerEmail,
    o.OrderDate,
    o.OrderStatus,
    o.OrderTotal,
    COUNT(oi.OrderItemId) AS TotalItems,
    SUM(oi.Quantity) AS TotalQuantity
FROM dbo.Orders o
LEFT JOIN dbo.OrderItems oi ON o.OrderId = oi.OrderId
GROUP BY o.OrderId, o.OrderNumber, o.CustomerName, o.CustomerEmail, o.OrderDate, o.OrderStatus, o.OrderTotal;
GO

-- Grant Permissions (adjust as needed for your application user)
-- GRANT EXECUTE ON sp_GetAllProducts TO [YourAppUser];
-- GRANT EXECUTE ON sp_GetProductById TO [YourAppUser];
-- ... grant other permissions as needed

PRINT 'Database schema created successfully!';
PRINT 'Tables created: Categories, Products, Orders, OrderItems';
PRINT 'Stored procedures created: 11 procedures';
PRINT 'Views created: vw_ProductInventorySummary, vw_OrderSummary';
GO

-- Query to verify sample data
SELECT 'Categories' AS TableName, COUNT(*) AS RecordCount FROM dbo.Categories
UNION ALL
SELECT 'Products', COUNT(*) FROM dbo.Products
UNION ALL
SELECT 'Orders', COUNT(*) FROM dbo.Orders
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM dbo.OrderItems;
GO
