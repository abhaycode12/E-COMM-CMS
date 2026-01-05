-- LuminaCommerce Enterprise CMS Database Schema
-- Charset: utf8mb4 | Engine: InnoDB

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. AUTHENTICATION & ACCESS CONTROL (RBAC)
-- ==========================================

-- System Users (Staff/Admins)
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `last_login_at` TIMESTAMP NULL DEFAULT NULL,
    `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_email_unique` (`email`),
    INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles (e.g., Super Admin, Manager, Vendor)
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `display_name` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions (Action + Module based, e.g., 'products.create')
CREATE TABLE `permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `module` VARCHAR(100) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `name` VARCHAR(200) NOT NULL, -- module.action
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `permissions_name_unique` (`name`),
    INDEX `idx_perm_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
    `role_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Granular User Overrides (Resolution Priority 1)
CREATE TABLE `user_permission_overrides` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,
    `is_allowed` BOOLEAN NOT NULL, -- TRUE: force allow, FALSE: force deny
    PRIMARY KEY (`user_id`, `permission_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. PRODUCT & CATALOG MANAGEMENT
-- ==========================================

-- Multi-level Categories
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `parent_id` BIGINT UNSIGNED DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `image_path` VARCHAR(255) DEFAULT NULL,
    `status` BOOLEAN DEFAULT TRUE,
    `meta_title` VARCHAR(255) DEFAULT NULL,
    `meta_description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `categories_slug_unique` (`slug`),
    FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `brand` VARCHAR(255) DEFAULT NULL,
    `description` LONGTEXT DEFAULT NULL,
    `status` ENUM('draft', 'active', 'archived', 'out_of_stock') DEFAULT 'draft',
    `hsn_code` VARCHAR(20) DEFAULT NULL,
    `gst_percentage` DECIMAL(5,2) DEFAULT 18.00,
    `meta_title` VARCHAR(255) DEFAULT NULL,
    `meta_description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `products_slug_unique` (`slug`),
    INDEX `idx_products_status` (`status`),
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Variants (SKU Management)
CREATE TABLE `product_variants` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `barcode` VARCHAR(100) DEFAULT NULL,
    `price` DECIMAL(15,2) NOT NULL,
    `compare_at_price` DECIMAL(15,2) DEFAULT NULL,
    `stock_quantity` INT DEFAULT 0,
    `weight` DECIMAL(8,2) DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `variants_sku_unique` (`sku`),
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. CUSTOMER MANAGEMENT
-- ==========================================

CREATE TABLE `customers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_blocked` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customer_addresses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('shipping', 'billing') NOT NULL,
    `is_default` BOOLEAN DEFAULT FALSE,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address_line1` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `zip_code` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. ORDER & PAYMENT MANAGEMENT
-- ==========================================

CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(50) NOT NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
    `payment_status` ENUM('unpaid', 'paid', 'refunded', 'partially_refunded') DEFAULT 'unpaid',
    `subtotal` DECIMAL(15,2) NOT NULL,
    `tax_amount` DECIMAL(15,2) NOT NULL,
    `shipping_cost` DECIMAL(15,2) NOT NULL,
    `discount_amount` DECIMAL(15,2) DEFAULT 0,
    `total` DECIMAL(15,2) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `orders_number_unique` (`order_number`),
    INDEX `idx_order_status` (`status`),
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items (Snapshotting Price at Time of Order)
CREATE TABLE `order_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL, -- Snapshot
    `sku` VARCHAR(100) NOT NULL,  -- Snapshot
    `quantity` INT NOT NULL,
    `price` DECIMAL(15,2) NOT NULL, -- Snapshot
    `total` DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `transaction_id` VARCHAR(100) DEFAULT NULL,
    `method` VARCHAR(50) NOT NULL, -- stripe, paypal, cod
    `amount` DECIMAL(15,2) NOT NULL,
    `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. CMS & MARKETING
-- ==========================================

CREATE TABLE `pages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    `meta_title` VARCHAR(255) DEFAULT NULL,
    `meta_description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `coupons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `type` ENUM('fixed', 'percentage') NOT NULL,
    `value` DECIMAL(15,2) NOT NULL,
    `min_order_amount` DECIMAL(15,2) DEFAULT 0,
    `starts_at` TIMESTAMP NULL,
    `ends_at` TIMESTAMP NULL,
    `usage_limit` INT DEFAULT NULL,
    `used_count` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (`id`),
    UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. AUDIT & LOGGING
-- ==========================================

-- Data Drift Audit Logs
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED DEFAULT NULL,
    `role_id` BIGINT UNSIGNED DEFAULT NULL, -- Role context at time of action
    `module` VARCHAR(100) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `old_data` JSON DEFAULT NULL,
    `new_data` JSON DEFAULT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_audit_user` (`user_id`),
    INDEX `idx_audit_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. SETTINGS & REVIEWS
-- ==========================================

CREATE TABLE `settings` (
    `key` VARCHAR(100) NOT NULL,
    `value` LONGTEXT DEFAULT NULL,
    `context` VARCHAR(50) DEFAULT 'system', -- system, mail, payment
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `rating` TINYINT NOT NULL, -- 1 to 5
    `comment` TEXT DEFAULT NULL,
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;