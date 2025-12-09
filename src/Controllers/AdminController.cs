using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using ECommerceApp.Models;

namespace ECommerceApp.Controllers
{
    public class AdminController : Controller
    {
        // GET: Admin
        public ActionResult Index()
        {
            var products = ProductsController.GetAllProducts();
            return View(products);
        }

        // GET: Admin/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Admin/Create
        [HttpPost]
        public ActionResult Create(Product product)
        {
            if (ModelState.IsValid)
            {
                var products = ProductsController.GetAllProducts();
                product.Id = products.Any() ? products.Max(p => p.Id) + 1 : 1;
                ProductsController.AddProduct(product);
                TempData["Message"] = "Product added successfully!";
                return RedirectToAction("Index");
            }
            return View(product);
        }

        // GET: Admin/Edit/5
        public ActionResult Edit(int id)
        {
            var product = ProductsController.GetProductById(id);
            if (product == null)
            {
                return HttpNotFound();
            }
            return View(product);
        }

        // POST: Admin/Edit/5
        [HttpPost]
        public ActionResult Edit(Product product)
        {
            if (ModelState.IsValid)
            {
                ProductsController.UpdateProduct(product);
                TempData["Message"] = "Product updated successfully!";
                return RedirectToAction("Index");
            }
            return View(product);
        }

        // POST: Admin/Delete/5
        [HttpPost]
        public ActionResult Delete(int id)
        {
            ProductsController.DeleteProduct(id);
            TempData["Message"] = "Product deleted successfully!";
            return RedirectToAction("Index");
        }
    }
}
