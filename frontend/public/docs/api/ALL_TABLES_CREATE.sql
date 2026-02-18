-- ============================================================================
-- CAMS SERVICE - COMPLETE DATABASE SCHEMA
-- All 17 Tables - MySQL/MariaDB CREATE TABLE Statements
-- ============================================================================
-- Project: CAMS Service Website (KidzRunz Program)
-- Version: 1.0
-- Date: October 30, 2025
-- Database: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4_unicode_ci
-- ============================================================================
-- © 2025 Kash Singh - CAMS Service
-- ============================================================================

-- ==========================
-- 1. USERS TABLE
-- ==========================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NULL,
    address TEXT NULL,
    postcode VARCHAR(10) NULL,
    role ENUM('parent', 'trainer', 'admin', 'super_admin') DEFAULT 'parent',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 2. TRAINERS TABLE
-- ==========================
CREATE TABLE trainers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    bio TEXT NOT NULL,
    full_description TEXT NULL,
    image VARCHAR(255) NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT UNSIGNED DEFAULT 0,
    specialties JSON NULL COMMENT 'Array of specialties',
    certifications JSON NULL COMMENT 'Array of certifications with year',
    experience_years TINYINT UNSIGNED DEFAULT 0,
    availability_notes TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_is_featured (is_featured),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 3. PACKAGES TABLE
-- ==========================
CREATE TABLE packages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    hours INT UNSIGNED NOT NULL COMMENT 'Total hours in package',
    duration_weeks TINYINT UNSIGNED NOT NULL,
    age_group VARCHAR(50) NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    max_participants TINYINT UNSIGNED DEFAULT 12,
    spots_remaining TINYINT UNSIGNED DEFAULT 12,
    total_spots TINYINT UNSIGNED DEFAULT 12,
    features JSON NULL COMMENT 'Array of package features',
    what_to_expect TEXT NULL,
    requirements JSON NULL COMMENT 'Array of requirements',
    image VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active),
    INDEX idx_is_popular (is_popular),
    INDEX idx_price (price),
    INDEX idx_age_group (age_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 4. PACKAGE_TRAINERS TABLE (Junction)
-- ==========================
CREATE TABLE package_trainers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    package_id BIGINT UNSIGNED NOT NULL,
    trainer_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_package_trainer (package_id, trainer_id),
    INDEX idx_package_id (package_id),
    INDEX idx_trainer_id (trainer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 5. BOOKINGS TABLE
-- ==========================
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    package_id BIGINT UNSIGNED NOT NULL,
    trainer_id BIGINT UNSIGNED NOT NULL,
    booking_reference VARCHAR(20) NOT NULL UNIQUE COMMENT 'KR-YYYY-NNNNNN',
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    payment_amount DECIMAL(10, 2) NOT NULL,
    total_hours INT UNSIGNED NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_details JSON NOT NULL COMMENT 'Parent contact information',
    children_details JSON NOT NULL COMMENT 'Array of children information',
    admin_notes TEXT NULL,
    cancellation_reason TEXT NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE RESTRICT,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE RESTRICT,
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_booking_date (booking_date),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 6. CHILDREN_DETAILS TABLE
-- ==========================
CREATE TABLE children_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    age TINYINT UNSIGNED NOT NULL,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL,
    medical_conditions TEXT NULL,
    allergies TEXT NULL,
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_phone VARCHAR(15) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 7. BOOKING_DAYS TABLE
-- ==========================
CREATE TABLE booking_days (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(3, 1) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    trainer_choice BOOLEAN DEFAULT FALSE COMMENT 'If true, trainer decides activities',
    trainer_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 8. ACTIVITIES TABLE
-- ==========================
CREATE TABLE activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    category ENUM('physical', 'creative', 'educational', 'sensory') NOT NULL,
    duration DECIMAL(3, 1) NOT NULL COMMENT 'Duration in hours (e.g., 1.0, 1.5)',
    description TEXT NOT NULL,
    equipment_needed TEXT NULL,
    age_appropriate VARCHAR(50) NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    image VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_duration (duration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 9. BOOKING_ACTIVITIES TABLE (Junction)
-- ==========================
CREATE TABLE booking_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_day_id BIGINT UNSIGNED NOT NULL,
    activity_id BIGINT UNSIGNED NULL COMMENT 'NULL if custom activity',
    is_custom BOOLEAN DEFAULT FALSE,
    custom_name VARCHAR(100) NULL,
    custom_duration DECIMAL(3, 1) NULL,
    custom_description TEXT NULL,
    custom_equipment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_day_id) REFERENCES booking_days(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    INDEX idx_booking_day_id (booking_day_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_is_custom (is_custom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 10. REVIEWS TABLE
-- ==========================
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    trainer_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL COMMENT '1-5 stars',
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    admin_response TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trainer_id (trainer_id),
    INDEX idx_is_approved (is_approved),
    INDEX idx_is_featured (is_featured),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 11. BLOG_POSTS TABLE
-- ==========================
CREATE TABLE blog_posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    author_bio TEXT NULL,
    author_image VARCHAR(255) NULL,
    image VARCHAR(255) NULL,
    category VARCHAR(50) NOT NULL,
    tags JSON NULL COMMENT 'Array of tags',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    views_count INT UNSIGNED DEFAULT 0,
    read_time_minutes TINYINT UNSIGNED DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_is_published (is_published),
    INDEX idx_category (category),
    INDEX idx_published_at (published_at),
    FULLTEXT idx_search (title, excerpt, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 12. FAQS TABLE
-- ==========================
CREATE TABLE faqs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    `order` INT UNSIGNED DEFAULT 0 COMMENT 'Display order within category',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_is_published (is_published),
    INDEX idx_category (category),
    INDEX idx_order (`order`),
    FULLTEXT idx_search (question, answer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 13. CONTACT_SUBMISSIONS TABLE
-- ==========================
CREATE TABLE contact_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NULL,
    message TEXT NOT NULL,
    source_page VARCHAR(255) NULL COMMENT 'Page where form was submitted',
    is_read BOOLEAN DEFAULT FALSE,
    responded_at TIMESTAMP NULL,
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 14. NEWSLETTER_SUBSCRIPTIONS TABLE
-- ==========================
CREATE TABLE newsletter_subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 15. SETTINGS TABLE
-- ==========================
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    value JSON NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 16. PASSWORD_RESET_TOKENS TABLE
-- ==========================
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 17. PERSONAL_ACCESS_TOKENS TABLE
-- ==========================
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tokenable (tokenable_type, tokenable_id),
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- 18. TRAINER_AVAILABILITY TABLE
-- ==========================
CREATE TABLE trainer_availability (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trainer_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE COMMENT 'FALSE if booked/blocked',
    booking_id BIGINT UNSIGNED NULL COMMENT 'Reference to booking if booked',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_trainer_id (trainer_id),
    INDEX idx_date (date),
    INDEX idx_is_available (is_available),
    INDEX idx_trainer_date (trainer_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- END OF DATABASE SCHEMA
-- ============================================================================
-- MIGRATION ORDER (when creating tables):
-- 1. users
-- 2. trainers
-- 3. packages
-- 4. package_trainers
-- 5. bookings
-- 6. children_details
-- 7. booking_days
-- 8. activities
-- 9. booking_activities
-- 10. reviews
-- 11. blog_posts
-- 12. faqs
-- 13. contact_submissions
-- 14. newsletter_subscriptions
-- 15. settings
-- 16. password_reset_tokens
-- 17. personal_access_tokens
-- 18. trainer_availability
-- ============================================================================
-- © 2025 Kash Singh - CAMS Service
-- ============================================================================

