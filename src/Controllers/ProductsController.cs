using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using ECommerceApp.Models;

namespace ECommerceApp.Controllers
{
    public class ProductsController : Controller
    {
        private static List<Product> products = new List<Product>
        {
            new Product { Id = 1, Name = "Laptop", Category = "Electronics", Price = 999.99m, InStock = true },
            new Product { Id = 2, Name = "Mouse", Category = "Electronics", Price = 29.99m, InStock = true },
            new Product { Id = 3, Name = "Keyboard", Category = "Electronics", Price = 79.99m, InStock = true },
            new Product { Id = 4, Name = "Monitor", Category = "Electronics", Price = 299.99m, InStock = false },
            new Product { Id = 5, Name = "Desk", Category = "Furniture", Price = 399.99m, InStock = true }
        };

        // GET: Products
        public ActionResult Index(string category = null)
        {
            var filteredProducts = string.IsNullOrEmpty(category)
                ? products
                : products.Where(p => p.Category.Equals(category, System.StringComparison.OrdinalIgnoreCase)).ToList();

            ViewBag.Categories = products.Select(p => p.Category).Distinct().ToList();
            ViewBag.SelectedCategory = category;

            return View(filteredProducts);
        }

        // GET: Products/Details/5
        public ActionResult Details(int id)
        {
            var product = products.FirstOrDefault(p => p.Id == id);
            if (product == null)
            {
                return HttpNotFound();
            }
            return View(product);
        }

        // Static helper method for cart controller
        public static Product GetProductById(int id)
        {
            return products.FirstOrDefault(p => p.Id == id);
        }

        public static List<Product> GetAllProducts()
        {
            return products;
        }

        // Admin methods for managing products
        public static void AddProduct(Product product)
        {
            products.Add(product);
        }

        public static void UpdateProduct(Product updatedProduct)
        {
            var product = products.FirstOrDefault(p => p.Id == updatedProduct.Id);
            if (product != null)
            {
                product.Name = updatedProduct.Name;
                product.Category = updatedProduct.Category;
                product.Price = updatedProduct.Price;
                product.InStock = updatedProduct.InStock;
            }
        }

        public static void DeleteProduct(int id)
        {
            var product = products.FirstOrDefault(p => p.Id == id);
            if (product != null)
            {
                products.Remove(product);
            }
        }
    }
}
