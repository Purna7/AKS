# Library Management System

A comprehensive web-based Library Management System built with ASP.NET Core MVC.

## Features

### 📚 Book Management
- Add, edit, and delete books
- Track book inventory (total copies, available copies)
- Categorize books by genre
- Store detailed book information (ISBN, author, publisher, publication year)
- Track shelf location for easy finding
- Search and filter books by title, author, ISBN, or category

### 👥 Visitor Management
- Register new library visitors/members
- Manage visitor profiles with contact information
- Multiple membership types (Standard, Premium, Student)
- Track membership expiry dates
- Monitor books borrowed and returned per visitor
- Calculate and track fines for overdue books

### 📖 Transaction Management
- Issue books to visitors
- Process book returns
- Track borrow dates, due dates, and return dates
- Calculate late fees automatically ($1.00 per day)
- View transaction history with filtering options
- Mark transactions as Borrowed, Returned, Overdue, or Lost

### 📊 Dashboard
- Real-time statistics:
  - Total books in inventory
  - Available books
  - Borrowed books count
  - Active members
- Quick action buttons
- System overview and features

## Technology Stack

- **Framework**: ASP.NET Core 8.0 MVC
- **Language**: C# 12
- **Frontend**: Bootstrap 5, HTML5, CSS3
- **Data Storage**: In-memory (for demo purposes)

## Project Structure

```
LibraryManagement/
├── Controllers/
│   ├── HomeController.cs          # Dashboard
│   ├── BooksController.cs         # Book CRUD operations
│   ├── VisitorsController.cs      # Visitor management
│   └── TransactionsController.cs  # Borrow/Return operations
├── Models/
│   ├── Book.cs                    # Book entity
│   ├── Visitor.cs                 # Visitor entity
│   └── BorrowTransaction.cs       # Transaction entity
├── Views/
│   ├── Home/
│   │   └── Index.cshtml           # Dashboard view
│   ├── Books/
│   │   └── Index.cshtml           # Book listing
│   ├── Visitors/
│   │   └── Index.cshtml           # Visitor listing
│   └── Transactions/
│       ├── Index.cshtml           # Transaction listing
│       └── Borrow.cshtml          # Borrow form
└── wwwroot/                       # Static files
```

## Getting Started

### Prerequisites
- .NET 8.0 SDK or later
- Visual Studio 2022 / VS Code / Rider

### Running the Application

1. **Navigate to project directory:**
   ```bash
   cd AKS/LibraryManagement/LibraryManagement
   ```

2. **Restore dependencies:**
   ```bash
   dotnet restore
   ```

3. **Build the project:**
   ```bash
   dotnet build
   ```

4. **Run the application:**
   ```bash
   dotnet run
   ```

5. **Open browser:**
   Navigate to `https://localhost:5001` or the URL shown in terminal

## Sample Data

The application comes with pre-populated sample data:

### Books (5 titles):
- Clean Code by Robert C. Martin
- Design Patterns by Gang of Four
- Effective Java by Joshua Bloch
- Learning Python by Mark Lutz
- Building Microservices by Sam Newman

### Visitors (3 members):
- John Doe (Premium)
- Jane Smith (Standard)
- Robert Johnson (Student)

## Key Functionality

### Borrowing a Book
1. Go to Transactions > New Borrow Transaction
2. Select a visitor with valid membership
3. Select an available book
4. Set loan period (default 14 days)
5. Submit to issue the book

### Returning a Book
1. Go to Transactions
2. Find the "Borrowed" or "Overdue" transaction
3. Click "Return" button
4. Specify book condition
5. Pay any outstanding fines if applicable

### Managing Fines
- **Automatic Calculation**: $1.00 per day overdue
- **Status Updates**: Transactions automatically marked as "Overdue"
- **Fine Tracking**: Fines tracked per visitor and per transaction

## Business Rules

### Membership Types
- **Standard**: 1-year validity
- **Premium**: 2-year validity  
- **Student**: 1-year validity (extended)

### Loan Policies
- Default loan period: 14 days
- Maximum loan period: 30 days
- Late fine: $1.00 per day
- Books per visitor: Up to 5 (configurable)

### Book Availability
- Books marked unavailable when all copies borrowed
- Automatic status update on return
- Real-time inventory tracking

## Future Enhancements

### Database Integration
- Replace in-memory storage with SQL Server/PostgreSQL
- Entity Framework Core for ORM
- Data persistence across sessions

### Additional Features
- [ ] Email notifications for due dates
- [ ] Reservation system for unavailable books
- [ ] Report generation (PDF/Excel)
- [ ] Book recommendation engine
- [ ] Barcode scanning for quick checkout
- [ ] Online catalog for members
- [ ] Mobile app integration
- [ ] Advanced search with filters
- [ ] Book reviews and ratings
- [ ] Multi-library support

### Security
- [ ] User authentication and authorization
- [ ] Role-based access control (Admin, Librarian, Member)
- [ ] Audit logging for all transactions
- [ ] Data encryption

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Dashboard |
| GET | /Books | List all books |
| POST | /Books/Create | Add new book |
| GET | /Visitors | List all visitors |
| POST | /Visitors/Create | Register visitor |
| GET | /Transactions | List transactions |
| POST | /Transactions/Borrow | Issue book |
| POST | /Transactions/Return/{id} | Return book |

## Contributing

This is a demonstration project for the AKS repository. Feel free to extend and customize as needed.

## License

This project is part of the AKS repository and follows its licensing terms.

## Support

For issues or questions, please refer to the main AKS repository documentation.

---

**Created**: December 2025  
**Framework**: ASP.NET Core 8.0 MVC  
**Status**: Development/Demo Version
