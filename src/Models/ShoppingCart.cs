using System;
using System.Collections.Generic;
using System.Linq;

namespace ECommerceApp.Models
{
    public class ShoppingCart
    {
        private static ShoppingCart _instance;
        private List<CartItem> _items;

        private ShoppingCart()
        {
            _items = new List<CartItem>();
        }

        public static ShoppingCart Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new ShoppingCart();
                }
                return _instance;
            }
        }

        public List<CartItem> Items => _items;

        public void AddItem(Product product, int quantity = 1)
        {
            var existingItem = _items.FirstOrDefault(i => i.Product.Id == product.Id);
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
            }
            else
            {
                _items.Add(new CartItem { Product = product, Quantity = quantity });
            }
        }

        public void RemoveItem(int productId)
        {
            _items.RemoveAll(i => i.Product.Id == productId);
        }

        public void UpdateQuantity(int productId, int quantity)
        {
            var item = _items.FirstOrDefault(i => i.Product.Id == productId);
            if (item != null)
            {
                if (quantity <= 0)
                {
                    RemoveItem(productId);
                }
                else
                {
                    item.Quantity = quantity;
                }
            }
        }

        public decimal GetTotal()
        {
            return _items.Sum(i => i.Subtotal);
        }

        public int GetItemCount()
        {
            return _items.Sum(i => i.Quantity);
        }

        public void Clear()
        {
            _items.Clear();
        }
    }
}
