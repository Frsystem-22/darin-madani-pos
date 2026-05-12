# Darin Madani POS - TODO

## Phase 1: Database Schema & i18n Setup
- [x] SQL Server compatible schema (Drizzle ORM with MySQL2 adapter)
- [x] i18n setup (react-i18next) with AR/EN translations
- [x] Global theme with gold/dark palette

## Phase 2: Backend API - Auth, Users, Products, Warehouses
- [x] Auth: login, logout, JWT middleware
- [x] Users CRUD with granular permissions per action
- [x] Products CRUD with multi-image upload (S3)
- [x] Categories CRUD
- [x] Warehouses CRUD (multiple warehouses)
- [x] Stock movements (purchase entries, transfers between warehouses)
- [x] Barcode generation endpoint

## Phase 3: Backend API - Invoices, Returns, Payments, WhatsApp
- [x] Invoices CRUD (sale invoices)
- [x] Invoice items with discount support
- [x] Returns management with stock update
- [x] MyFatoorah payment gateway integration (SADAD barcode)
- [x] Evolution API WhatsApp notification
- [x] Thermal receipt generation (58mm/80mm)
- [x] Customers CRUD

## Phase 4: Frontend - Layout, Auth, Dashboard, i18n
- [x] i18n language switcher (AR/EN) with RTL/LTR toggle
- [x] DashboardLayout with sidebar (AppLayout.tsx)
- [x] Dashboard with KPIs and charts
- [x] Permission-based navigation

## Phase 5: Frontend - POS, Inventory, Warehouses, Barcode
- [x] POS screen (product grid, cart, customer, payment methods)
- [x] Barcode scanner integration
- [x] Barcode label printing (thermal)
- [x] Inventory management (add/edit/delete products with images)
- [x] Multi-warehouse management
- [x] Stock movements / purchase entries
- [x] Low stock alerts

## Phase 6: Frontend - Invoices, Returns, Payment Gateway, WhatsApp
- [x] Invoice list and detail view
- [x] Thermal receipt print (58mm)
- [x] WhatsApp send button
- [x] MyFatoorah SADAD barcode display
- [x] Returns management UI
- [x] Discount management

## Phase 7: Frontend - CRM, Users, Permissions, Reports
- [x] Customer management (CRM)
- [x] User management with role/permission matrix
- [x] Reports: daily/monthly sales, best sellers, stock value
- [x] Settings page (store info, WhatsApp config, payment gateway)

## Phase 8: Testing & Deployment
- [x] Vitest unit tests (6 tests passing)
- [x] Final checkpoint
- [x] Push to GitHub
- [ ] Configure MyFatoorah credentials
- [ ] Configure Evolution WhatsApp credentials
- [ ] Test barcode scanner with physical device
- [ ] Test thermal printer

## Auth System - Independent Login (No Manus OAuth)
- [x] إضافة حقل password (hashed) لجدول users
- [x] Backend: auth router مع login/logout/me بدون OAuth
- [x] Backend: JWT middleware مستقل
- [x] Frontend: صفحة Login بيوزر وباسورد
- [x] Frontend: إزالة Manus OAuth من كل الصفحات
- [x] إنشاء مستخدم admin افتراضي في قاعدة البيانات

## POS Improvements - Round 2
- [x] السعر شامل الضريبة: عرض السعر الأساسي + الضريبة منفصلَين في الفاتورة والمنتجات
- [x] خانة سريعة لإضافة بيانات عميل جديد داخل شاشة POS بدون مغادرتها
- [x] دفع متعدد: إمكانية تقسيم المبلغ على أكثر من طريقة دفع في نفس الفاتورة
- [x] طباعة ليبلات الباركود من صفحة المخزون مع دعم مسح الباركود في POS

## UI Fixes - Round 3
- [x] إضافة خانة رفع الصور في نموذج إضافة/تعديل المنتج
- [x] حذف حقل اللون من نموذج إضافة التصنيف

## Barcode Scanner Enhancement - POS
- [x] حقل بحث مخصص يستقبل إدخال قارئ الباركود تلقائياً (auto-focus دائم)
- [x] إضافة المنتج تلقائياً للسلة عند مسح الباركود بدون ضغط Enter
- [x] بحث سريع بالاسم مع نتائج فورية (debounce 300ms)
- [x] إشعار بصري عند إضافة منتج بالباركود

## WhatsApp Direct Connection (Evolution API QR)
- [x] Backend: endpoint لإنشاء instance وجلب QR code
- [x] Backend: endpoint للتحقق من حالة الاتصال
- [x] Backend: endpoint لقطع الاتصال
- [x] Frontend: صفحة إعدادات واتساب - إدخال رقم الجوال + عرض QR
- [x] Frontend: مؤقت تحديث QR كل 30 ثانية حتى يتم الاتصال
- [x] Frontend: عرض حالة الاتصال (متصل/غير متصل) في صفحة الإعدادات

## Barcode Scanner Enhancement - POS (Round 2)
- [x] حقل بحث مخصص يستقبل إدخال قارئ الباركود تلقائياً
- [x] إضافة المنتج تلقائياً للسلة عند مسح الباركود
- [x] بحث سريع بالاسم مع نتائج فورية

## Certified Invoice with Barcode
- [x] فاتورة معتمدة بتصميم Darin Madani مع شعار المتجر
- [x] باركود الفاتورة (QR أو Code128) يحتوي على رقم الفاتورة
- [x] صفحة فاتورة مستقلة قابلة للطباعة والمشاركة (/invoice/:id)
- [x] إرسال رابط الفاتورة عبر واتساب
