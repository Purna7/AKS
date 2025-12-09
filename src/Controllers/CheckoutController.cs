using ECommerceApp.Models;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace ECommerceApp.Controllers
{
    public class CheckoutController : Controller
    {
        private ShoppingCart cart = ShoppingCart.Instance;
        private static List<Order> orders = new List<Order>();
        private static int nextOrderId = 1;

        public ActionResult Index()
        {
            if (cart.Items.Count == 0)
            {
                TempData["Message"] = "Your cart is empty!";
                return RedirectToAction("Index", "Products");
            }

            var order = new Order
            {
                Items = new List<CartItem>(cart.Items),
                Total = cart.GetTotal()
            };

            return View(order);
        }

        [HttpPost]
        public ActionResult ProcessOrder(Order order)
        {
            if (ModelState.IsValid)
            {
                order.Id = nextOrderId++;
                order.OrderDate = DateTime.UtcNow;
                order.Status = "Processing";
                order.Items = new List<CartItem>(cart.Items);
                order.Total = cart.GetTotal();

                orders.Add(order);
                cart.Clear();

                return RedirectToAction("Complete", new { orderId = order.Id });
            }

            return View("Index", order);
        }

        public ActionResult Complete(int orderId)
        {
            var order = orders.Find(o => o.Id == orderId);
            if (order == null)
            {
                return RedirectToAction("Index", "Home");
            }

            return View(order);
        }
    }
}
