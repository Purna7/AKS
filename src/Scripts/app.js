// AngularJS App Module
var kloudkartApp = angular.module('kloudkartApp', []);

// Products Controller
kloudkartApp.controller('ProductsController', ['$scope', '$http', function($scope, $http) {
    $scope.products = [];
    $scope.categories = [];
    $scope.selectedCategory = null;
    $scope.searchQuery = '';
    $scope.loading = true;
    
    // Load products
    $scope.loadProducts = function() {
        $scope.loading = true;
        var url = '/Products/Index';
        if ($scope.selectedCategory) {
            url += '?category=' + $scope.selectedCategory;
        }
        
        // Simulate loading (in real scenario, use $http to fetch from API)
        setTimeout(function() {
            $scope.loading = false;
            $scope.$apply();
        }, 300);
    };
    
    // Filter by category
    $scope.filterByCategory = function(category) {
        $scope.selectedCategory = category;
        $scope.loadProducts();
    };
    
    // Search products
    $scope.filteredProducts = function() {
        if (!$scope.searchQuery) {
            return $scope.products;
        }
        return $scope.products.filter(function(product) {
            return product.Name.toLowerCase().includes($scope.searchQuery.toLowerCase()) ||
                   product.Category.toLowerCase().includes($scope.searchQuery.toLowerCase());
        });
    };
    
    // Add to cart
    $scope.addToCart = function(productId, quantity) {
        quantity = quantity || 1;
        $http.post('/Cart/AddToCart', { productId: productId, quantity: quantity })
            .then(function(response) {
                $scope.updateCartCount();
                $scope.showMessage('Product added to cart!', 'success');
            })
            .catch(function(error) {
                $scope.showMessage('Error adding to cart', 'error');
            });
    };
    
    // Update cart count
    $scope.updateCartCount = function() {
        $http.get('/Cart/GetCartCount')
            .then(function(response) {
                var badge = document.getElementById('cart-count');
                if (badge) {
                    badge.textContent = response.data.count || 0;
                    badge.classList.add('bounce');
                    setTimeout(function() {
                        badge.classList.remove('bounce');
                    }, 500);
                }
            });
    };
    
    // Show message
    $scope.showMessage = function(message, type) {
        var alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-' + type + ' alert-floating';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(function() {
            alertDiv.classList.add('fade-out');
            setTimeout(function() {
                document.body.removeChild(alertDiv);
            }, 300);
        }, 3000);
    };
    
    // Initialize
    $scope.loadProducts();
}]);

// Cart Controller
kloudkartApp.controller('CartController', ['$scope', '$http', function($scope, $http) {
    $scope.cart = {
        items: [],
        total: 0
    };
    $scope.loading = true;
    
    // Load cart
    $scope.loadCart = function() {
        $scope.loading = true;
        // In real scenario, fetch from server
        setTimeout(function() {
            $scope.loading = false;
            $scope.$apply();
        }, 300);
    };
    
    // Update quantity
    $scope.updateQuantity = function(productId, quantity) {
        if (quantity < 1) return;
        
        $http.post('/Cart/UpdateQuantity', { productId: productId, quantity: quantity })
            .then(function(response) {
                $scope.loadCart();
                $scope.showMessage('Cart updated!', 'success');
            })
            .catch(function(error) {
                $scope.showMessage('Error updating cart', 'error');
            });
    };
    
    // Remove item
    $scope.removeItem = function(productId) {
        if (!confirm('Remove this item from cart?')) return;
        
        $http.post('/Cart/RemoveFromCart', { productId: productId })
            .then(function(response) {
                $scope.loadCart();
                $scope.showMessage('Item removed from cart', 'success');
            })
            .catch(function(error) {
                $scope.showMessage('Error removing item', 'error');
            });
    };
    
    // Calculate total
    $scope.calculateTotal = function() {
        return $scope.cart.items.reduce(function(sum, item) {
            return sum + (item.Price * item.Quantity);
        }, 0);
    };
    
    // Show message
    $scope.showMessage = function(message, type) {
        var alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-' + type + ' alert-floating';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(function() {
            alertDiv.classList.add('fade-out');
            setTimeout(function() {
                document.body.removeChild(alertDiv);
            }, 300);
        }, 3000);
    };
    
    // Initialize
    $scope.loadCart();
}]);

// Admin Controller
kloudkartApp.controller('AdminController', ['$scope', '$http', function($scope, $http) {
    $scope.products = [];
    $scope.loading = true;
    $scope.editMode = false;
    $scope.currentProduct = {};
    
    // Load products
    $scope.loadProducts = function() {
        $scope.loading = true;
        // In real scenario, fetch from API
        setTimeout(function() {
            $scope.loading = false;
            $scope.$apply();
        }, 300);
    };
    
    // Show add form
    $scope.showAddForm = function() {
        $scope.editMode = true;
        $scope.currentProduct = {
            Id: 0,
            Name: '',
            Category: '',
            Price: 0,
            InStock: true
        };
    };
    
    // Show edit form
    $scope.editProduct = function(product) {
        $scope.editMode = true;
        $scope.currentProduct = angular.copy(product);
    };
    
    // Save product
    $scope.saveProduct = function() {
        var url = $scope.currentProduct.Id === 0 ? '/Admin/Create' : '/Admin/Edit';
        
        $http.post(url, $scope.currentProduct)
            .then(function(response) {
                $scope.loadProducts();
                $scope.cancelEdit();
                $scope.showMessage('Product saved successfully!', 'success');
            })
            .catch(function(error) {
                $scope.showMessage('Error saving product', 'error');
            });
    };
    
    // Delete product
    $scope.deleteProduct = function(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        $http.post('/Admin/Delete/' + productId)
            .then(function(response) {
                $scope.loadProducts();
                $scope.showMessage('Product deleted successfully!', 'success');
            })
            .catch(function(error) {
                $scope.showMessage('Error deleting product', 'error');
            });
    };
    
    // Cancel edit
    $scope.cancelEdit = function() {
        $scope.editMode = false;
        $scope.currentProduct = {};
    };
    
    // Show message
    $scope.showMessage = function(message, type) {
        var alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-' + type + ' alert-floating';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(function() {
            alertDiv.classList.add('fade-out');
            setTimeout(function() {
                document.body.removeChild(alertDiv);
            }, 300);
        }, 3000);
    };
    
    // Initialize
    $scope.loadProducts();
}]);

// Directives
kloudkartApp.directive('loadingSpinner', function() {
    return {
        restrict: 'E',
        template: '<div class="spinner"><div class="spinner-circle"></div></div>',
        replace: true
    };
});

// Filters
kloudkartApp.filter('currency', function() {
    return function(amount) {
        return '$' + parseFloat(amount).toFixed(2);
    };
});

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

function updateCartCount() {
    fetch('/Cart/GetCartCount')
        .then(response => response.json())
        .then(data => {
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = data.count || 0;
            }
        })
        .catch(error => console.error('Error fetching cart count:', error));
}
