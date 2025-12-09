using ECommerceApp.Models;
using System;
using System.Web.Mvc;

namespace ECommerceApp.Controllers
{
    public class CartController : Controller
    {
        private ShoppingCart cart = ShoppingCart.Instance;

        public ActionResult Index()
        {
            return View(cart.Items);
        }

        [HttpPost]
        public ActionResult AddToCart(int productId, int quantity = 1)
        {
            var product = ProductsController.GetProductById(productId);
            if (product != null)
            {
                cart.AddItem(product, quantity);
                TempData["Message"] = $"{product.Name} added to cart!";
            }
            return RedirectToAction("Index", "Products");
        }

        [HttpPost]
        public ActionResult UpdateQuantity(int productId, int quantity)
        {
            cart.UpdateQuantity(productId, quantity);
            return RedirectToAction("Index");
        }

        [HttpPost]
        public ActionResult RemoveFromCart(int productId)
        {
            cart.RemoveItem(productId);
            TempData["Message"] = "Item removed from cart.";
            return RedirectToAction("Index");
        }

        public JsonResult GetCartCount()
        {
            return Json(new { count = cart.GetItemCount() }, JsonRequestBehavior.AllowGet);
        }
    }
}
