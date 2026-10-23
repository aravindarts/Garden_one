# E-Commerce Backend API Catalog

This document is based on source inspection of the Spring Boot backend in this repository. It reflects actual controller mappings, service logic, security configuration, and payload handling found in the codebase. It intentionally excludes any frontend implementation or invented business rules.

## 3.1 Project Overview

- Application/module: BuyForGarden (artifact `BuyForGarden`, package prefix `com.breaksloop.ECommerce`)
- Framework: Spring Boot 2.5.2
- Java version: 11
- Packaging: WAR
- Database: PostgreSQL (`spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce`)
- API base path: `/api/v1/*` and `/api/v2/*` are the primary REST namespaces.
- Context path: none explicitly configured; controllers are mounted as root paths under the application context.
- API versioning: route-based versioning with `api/v1` and `api/v2` prefixes.
- Authentication: JWT-based authentication using `java-jwt`; token is generated in `JwtTokenProvider` and validated in `JwtTokenVerifier`. `Authorization: Bearer <token>` is the expected header pattern.
- Public URLs: `app.public-urls` in `application.yml` includes `/api/v1/**`, `/api/v2/**`, `/images/**`, `/sitemap.xml`, `/product-sitemap.xml`, `/page-sitemap.xml`.
- Swagger/OpenAPI: No Swagger/OpenAPI configuration or annotations were found (`@EnableSwagger2`, `Docket`, `@Api`, `springdoc`, etc.).
- Relevant controller packages:
  - `com.breaksloop.ECommerce.controller`
  - `com.breaksloop.ECommerce.controller.ext`
  - `com.breaksloop.ECommerce.controller.batjob`
  - `com.breaksloop.ECommerce.controller.payment`
  - `com.breaksloop.ECommerce.controller.report`
  - `com.breaksloop.ECommerce.controller.testbench`
- Global error response format: no custom `@ControllerAdvice`/`@ExceptionHandler` was found. Error payloads are produced by service-layer helpers using `masterUtil.constructResponsePayloadForErrors(...)` and a `status` field (`success`/`failed`) embedded in JSON responses.
- Security posture: `ApplicationSecurityConfig` disables CSRF, enables CORS, sets session management to `STATELESS`, permits all `publicUrls`, and requires authentication for everything else. `JwtAccessDeniedHandler` and `JwtAuthenticationEntryPoint` return HTTP 401/403 responses, but the response body is not custom-formatted in these classes.

## 3.2 API Inventory

| API ID | Domain | Method | Endpoint | Purpose | Authentication | Controller |
|---|---|---|---|---|---|---|
| AUTH-001 | Authentication | POST | `/api/v1/user/register` | Register a new user | Conditional/public via config | `UserController.register` |
| AUTH-002 | Authentication | POST | `/api/v1/user/login` | Login and return JWT | Conditional/public via config | `UserController.login` |
| AUTH-003 | Authentication | POST | `/api/v1/user/verification` | Verify user token | Conditional/public via config | `UserController.verification` |
| AUTH-004 | Authentication | POST | `/api/v1/user/reset-password` | Send password reset email | Conditional/public via config | `UserController.restPassword` |
| AUTH-005 | Authentication | POST | `/api/v1/user/updatePassword` | Update password using token | Conditional/public via config | `UserController.updatePassword` |
| AUTH-006 | Authentication | POST | `/api/v1/user/updateProfile` | Update profile/address info | Conditional/public via config | `UserController.updateProfile` |
| AUTH-007 | Authentication | POST | `/api/v1/user/loadShipmentDetails` | Load delivery/shipping address | Conditional/public via config | `UserController.loadShipmentDetails` |
| AUTH-008 | Authentication | POST | `/api/v1/user/loadUser` | Load current user details | Conditional/public via config | `UserController.loadUserDetails` |
| AUTH-009 | Authentication | POST | `/api/v1/user/search` | Search users (admin only) | Conditional/public via config | `UserController.search` |
| AUTH-010 | Authentication | POST | `/api/v1/user/update-user` | Update a user record (admin only) | Conditional/public via config | `UserController.updateUser` |
| AUTH-011 | Authentication | POST | `/api/v1/user/delete-user` | Delete/inactivate a user (admin only) | Conditional/public via config | `UserController.deleteUser` |
| HOME-001 | Home | POST | `/api/v1/home/feature-category` | Search featured categories | Conditional/public via config | `HomeController.searchFeaturedCategory` |
| HOME-002 | Home | POST | `/api/v1/home/feature-products` | Search featured products | Conditional/public via config | `HomeController.searchFeaturedProducts` |
| HOME-003 | Home | GET | `/api/v1/home/cat-list` | Load category list | Conditional/public via config | `HomeController.loadCatList` |
| HOME-004 | Home | GET | `/api/v1/home/menus` | Load menu tree | Conditional/public via config | `HomeController.loadmenu` |
| DISPLAY-001 | Catalog | POST | `/api/v1/displayproducts/search` | Search products with filters/pagination | Conditional/public via config | `DisplayProductsController.searchProducts` |
| DISPLAY-002 | Catalog | POST | `/api/v1/displayproducts/searchonlyproducts` | Product-only search result | Conditional/public via config | `DisplayProductsController.searchOnlyProducts` |
| DISPLAY-003 | Catalog | POST | `/api/v1/displayproducts/download/excel` | Export product results to Excel | Conditional/public via config | `DisplayProductsController.downloadProductsExcel` |
| DISPLAY-004 | Catalog | POST | `/api/v1/displayproducts/download/pdf` | Export product results to PDF | Conditional/public via config | `DisplayProductsController.downloadProductsPdf` |
| DISPLAY-005 | Catalog | GET | `/api/v1/displayproducts/find/{id}` | Fetch product by ID | Conditional/public via config | `DisplayProductsController.searchProductById` |
| DISPLAY-006 | Catalog | POST | `/api/v1/displayproducts/download/skus/excel` | Export SKU rows to Excel | Conditional/public via config | `DisplayProductsController.downloadSkusExcel` |
| DISPLAY-007 | Catalog | POST | `/api/v1/displayproducts/download/skus/pdf` | Export SKU rows to PDF | Conditional/public via config | `DisplayProductsController.downloadSkusPdf` |
| PRODUCT-001 | Product admin | POST | `/api/v2/setupproduct/add` | Create/update product record | Conditional/public via config | `ProductController.addProduct` |
| PRODUCT-002 | Product admin | POST | `/api/v2/setupproduct/delete-sku` | Delete SKU | Conditional/public via config | `ProductController.deleteSKU` |
| PRODUCT-003 | Product admin | POST | `/api/v2/setupproduct/delete` | Delete product | Conditional/public via config | `ProductController.deleteProduct` |
| FILE-001 | File management | POST | `/api/v1/fileUpload/upload` | Upload image and return metadata | Conditional/public via config | `FileUploadController.uploadFile` |
| FILE-002 | File management | POST | `/api/v1/fileUpload/productUpload/{fileName}` | Register uploaded file into product data | Conditional/public via config | `FileUploadController.productUpload` |
| CART-001 | Cart | POST | `/api/v2/cart/add` | Add single item to cart | Conditional/public via config | `CartController.addCart` |
| CART-002 | Cart | POST | `/api/v2/cart/addall` | Add multiple items to cart | Conditional/public via config | `CartController.addAllCart` |
| CART-003 | Cart | POST | `/api/v2/cart/delete` | Delete item from cart | Conditional/public via config | `CartController.deleteCart` |
| CART-004 | Cart | POST | `/api/v2/cart/search` | Search cart by user/filter | Conditional/public via config | `CartController.searchCart` |
| WISHLIST-001 | Wishlist | POST | `/api/v2/wishlist/add` | Add item to wishlist | Conditional/public via config | `WishlistController.addWishList` |
| WISHLIST-002 | Wishlist | POST | `/api/v2/wishlist/addall` | Add multiple wishlist items | Conditional/public via config | `WishlistController.addAllWishList` |
| WISHLIST-003 | Wishlist | POST | `/api/v2/wishlist/delete` | Remove wishlist item | Conditional/public via config | `WishlistController.deleteWishList` |
| WISHLIST-004 | Wishlist | POST | `/api/v2/wishlist/search` | Search wishlist entries | Conditional/public via config | `WishlistController.searchWishList` |
| FLAG-001 | Admin taxonomy | POST | `/api/v1/flag/add` | Add category/subcategory metadata | Conditional/public via config | `FlagController.addFlag` |
| FLAG-002 | Admin taxonomy | POST | `/api/v1/flag/update` | Update category/subcategory metadata | Conditional/public via config | `FlagController.updateFlag` |
| FLAG-003 | Admin taxonomy | POST | `/api/v1/flag/delete` | Delete flag record | Conditional/public via config | `FlagController.deleteFlag` |
| FLAG-004 | Admin taxonomy | POST | `/api/v1/flag/search` | Search flag records | Conditional/public via config | `FlagController.searchFlag` |
| FLAG-005 | Admin taxonomy | GET | `/api/v1/flag/all` | Load all flags | Conditional/public via config | `FlagController.loadFlags` |
| ORDER-001 | Orders | POST | `/api/v2/sale/find` | Find order by bill number | Conditional/public via config | `SaleController.findSaleByBillNumber` |
| ORDER-002 | Orders | POST | `/api/v2/sale/delivery` | Update delivery status | Conditional/public via config | `SaleController.delivery` |
| ORDER-003 | Orders | POST | `/api/v2/sale/cancel` | Cancel order | Conditional/public via config | `SaleController.cancelOrder` |
| ORDER-004 | Orders | POST | `/api/v2/sale/newsale` | Create new sale/order | Conditional/public via config | `SaleController.sale` |
| ORDER-005 | Orders | POST | `/api/v2/sale/applycoupon` | Apply coupon to cart/order | Conditional/public via config | `SaleController.applyCoupon` |
| ORDER-006 | Orders | POST | `/api/v2/sale/orderDetails/pdf` | Download order PDF | Conditional/public via config | `SaleController.downloadProductsPdf` |
| ORDER-007 | Orders | POST | `/api/v2/batjob/saleDetail/{id}` | Background job to summarise sale detail by ID | Conditional/public via config | `Batjobcontroller.runBatjobSaleDetailById` |
| REPORT-001 | Reporting | POST | `/api/v2/salereport/saledetail/search` | Search sale detail rows | Conditional/public via config | `SaleReportController.searchSale` |
| REPORT-002 | Reporting | POST | `/api/v2/salereport/download/excel` | Export sale detail report to Excel | Conditional/public via config | `SaleReportController.downloadOrdersExcel` |
| REPORT-003 | Reporting | POST | `/api/v2/salereport/download/pdf` | Export sale detail report to PDF | Conditional/public via config | `SaleReportController.downloadProductsPdf` |
| PAYMENT-001 | Payment | POST | `/api/v2/payment/stripe/create-payment` | Create Stripe charge for cart order | Conditional/public via config | `StripeController.createPayment` |
| META-001 | Metadata | GET | `/api/v1/meta/find/{id}` | Load metadata JSON by id | Conditional/public via config | `MetaController.findMetaData` |
| META-002 | Metadata | GET | `/api/v1/meta/shipments` | Load shipping/additional charge metadata | Conditional/public via config | `MetaController.shippingDetails` |
| META-003 | Metadata | GET | `/api/v1/meta/test` | Maintenance endpoint for resizing product images | Conditional/public via config | `MetaController.test` |
| META-004 | Metadata | GET | `/api/v1/meta/refresh-variables` | Refresh config variables | Conditional/public via config | `MetaController.refreshVariables` |
| META-005 | Metadata | GET | `/api/v1/meta/searchkey-seo-friendly` | Rename search keys to URL-safe format | Conditional/public via config | `MetaController.searchKeyReplaceHypen` |
| META-006 | Metadata | GET | `/api/v1/meta/rename-file-seo-friendly` | Copy/rename image files | Conditional/public via config | `MetaController.renameFileSeoFriendly` |
| NOTIFICATION-001 | Notification | POST | `/api/v1/notification/customer` | Send idle-customer reminder email | Conditional/public via config | `NotificationController.customerIdleNotification` |
| SEO-001 | SEO | GET | `/sitemap.xml` | Root sitemap index | Not required | `SitemapController.sitemap` |
| SEO-002 | SEO | GET | `/product-sitemap.xml` | Product URLs sitemap | Not required | `SitemapController.productSiteMap` |
| SEO-003 | SEO | GET | `/pages-sitemap.xml` | Page sitemap | Not required | `SitemapController.pagesSitemap` |
| DEBUG-001 | Test | GET | `/api/v1/test/htmlgen` | HTML/email generation smoke test | Conditional/public via config | `TestApi.htmlGenratorTest` |

## 3.3 Detailed API Documentation

### API ID: AUTH-001 — Register user
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/register`
- Purpose: Create a new user account and return a user payload plus status.
- Authentication: Conditional; security config marks `/api/v1/**` as public, but business logic uses `tokenPayload` when present.
- Authorization: Not explicitly enforced in controller. `UserRegistrationHelper` validates user role and status.
- Controller: `com.breaksloop.ECommerce.controller.UserController#registerUser`
- Service: `com.breaksloop.ECommerce.service.UserService#register`
**Frontend usage**
- Suggested page: registration screen.
- User action: submits registration form.
- Data required: first name, last name, email, password, role, mobile, DOB (some fields optional/derived).
- Related APIs: `AUTH-002`, `AUTH-003`, `AUTH-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json` (expected, not explicitly annotated)
**Request body:** Top-level envelope uses `payload` containing `requestId`, `requestPayload`, and optional `tokenPayload`. `requestPayload.userRegPld` is the user payload. Fields are derived from `PayloadConstants.USER_REG_PLD`, `FIRST_NAME`, `LAST_NAME`, `PASSWORD`, `EMAIL`, `ROLE`, `DOB`, `MOBILE`. Example: `{ "payload": { "requestId": "r1", "requestPayload": { "userRegPld": { "name": "Test", "lastName": "User", "email": "test@example.com", "password": "encryptedOrPlainText", "role": "USER", "mobileNo": "9999999999", "dob": "1990-01-01" } } } }`
**Success response:** HTTP `200 OK`; `responceObj` contains a user object and `status` is `success`.
**Error responses:** HTTP `200 OK` with `status`=`failed` and an error payload from `masterUtil.constructResponsePayloadForErrors(...)` when validation fails.
**Business rules:** Validates duplicate user names, required fields, and role handling (`USER`, `ADMIN`, `SUPER_ADMIN`, `GUEST`).
**API dependencies:** Usually followed by `AUTH-002` for login and `AUTH-003` for verification.
**Source references:** `UserController.java`, `UserService.java`, `UserRegistrationHelper.java`, `PayloadConstants.java`

### API ID: AUTH-002 — Login user
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/login`
- Purpose: Validate credentials and return a JWT-bearing success payload.
- Authentication: Conditional/public via config.
- Authorization: Not explicitly enforced in the controller.
- Controller: `UserController.loginUser`
- Service: `UserService.login`
**Frontend usage**
- Suggested page: login.
- User action: submit email, password and role.
- Data required: `userRegPld.email`, `userRegPld.password`, `userRegPld.role`.
- Related APIs: `AUTH-001`, `AUTH-005`, `AUTH-006`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Uses same payload wrapper; user credentials are inside `requestPayload.userRegPld`.
**Success response:** `200 OK`, with `responceObj`, `token`, and `status=success`.
**Error responses:** `200 OK` with `status=failed` and validation error payload.
**Business rules:** Allows guest role login with email-only checks; for other roles it checks username/password and active account.
**API dependencies:** This API generates the JWT used by downstream calls.
**Source references:** `UserController.java`, `UserService.java`, `JwtTokenProvider.java`, `UserRegistrationHelper.java`

### API ID: AUTH-003 — Verify account
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/verification`
- Purpose: Validate an email verification token.
- Authentication: Conditional/public via config.
- Authorization: None declared.
- Controller: `UserController.verification`
- Service: `UserService.verification`
**Frontend usage**
- Suggested page: email verification landing page.
- User action: click verification link or submit token.
- Data required: `verifyToken` in `requestPayload`.
- Related APIs: `AUTH-001`, `AUTH-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `{ "payload": { "requestId": "", "requestPayload": { "verifyToken": "..." } } }`
**Success response:** `200 OK` with `status=success`.
**Error responses:** `200 OK` with `status=failed` and validation payload on invalid/expired token.
**Business rules:** Uses `UserRegistrationHelper.validateVerifyToken()` and `varification()`.
**Source references:** `UserService.java`, `UserRegistrationHelper.java`

### API ID: AUTH-004 — Reset password request
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/reset-password`
- Purpose: Send a password-reset email using user email.
- Authentication: Conditional/public via config.
- Authorization: None declared.
- Controller: `UserController.restPassword`
- Service: `UserService.resetPassword`
**Frontend usage**
- Suggested page: forgot-password.
- User action: submit email.
- Data required: `email`.
- Related APIs: `AUTH-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `{ "payload": { "requestPayload": { "email": "user@example.com" } } }`
**Success response:** `200 OK` with `status=success`.
**Error responses:** `200 OK` with `status=failed` if email is invalid or user does not exist.
**Business rules:** Validates user existence and sends reset HTML email via `EmailService`.
**Source references:** `UserService.java`, `UserRegistrationHelper.java`, `EmailService.java`

### API ID: AUTH-005 — Update password
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/updatePassword`
- Purpose: Update the user password using a reset token.
- Authentication: Conditional/public via config.
- Authorization: None declared; token validation is performed.
- Controller: `UserController.updatePassword`
- Service: `UserService.updatePassoword`
**Frontend usage**
- Suggested page: reset-password form.
- User action: submit new password and token.
- Data required: `updatePassword.token` and the new password fields inside `requestPayload.updatePassword`.
- Related APIs: `AUTH-004`, `AUTH-002`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.updatePassword` object.
**Success response:** `200 OK` with updated user payload and `status=success`.
**Error responses:** `200 OK` with validation error payload.
**Business rules:** Uses `validateToken(...)` before password update.
**Source references:** `UserService.java`, `UserRegistrationHelper.java`

### API ID: AUTH-006 — Update profile
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/updateProfile`
- Purpose: Update the authenticated user's profile information and address.
- Authentication: Conditional/public via config.
- Authorization: Business code expects a user token via `tokenPayload`.
- Controller: `UserController.updateProfile`
- Service: `UserService.updateProfile`
**Frontend usage**
- Suggested page: customer profile page.
- User action: save address/profile fields.
- Data required: `userRegPld`, address payload.
- Related APIs: `AUTH-007`, `AUTH-008`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Request payload contains both user and address info; actual address parsing is done in `SaleServiceHelper.parseAddressByPayload(reqPayload)`.
**Success response:** `200 OK` with `status=success`.
**Error responses:** `200 OK` with `status=failed` and validation errors.
**Business rules:** Validates the address payload before constructing and saving the profile.
**Source references:** `UserService.java`, `SaleServiceHelper.java`, `UserRegistrationHelper.java`

### API ID: AUTH-007 — Load shipment details
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/loadShipmentDetails`
- Purpose: Load address/shipment info for the logged-in user.
- Authentication: Conditional/public via config.
- Authorization: Business logic checks `user.id` from `tokenPayload`.
- Controller: `UserController.loadShipmentDetails`
- Service: `UserService.loadshipmentDetails`
**Frontend usage**
- Suggested page: checkout, account shipping address.
- User action: fetch saved address details.
- Data required: user id or username/role from `requestPayload.userRegPld`.
- Related APIs: `AUTH-006`, `ORDER-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.userRegPld` with identity information.
**Success response:** `200 OK` with `responceObj` address payload and `status=success`.
**Error responses:** `200 OK` with `status=failed` when no user is resolved.
**Business rules:** Returns a single address payload or failed status.
**Source references:** `UserService.java`, `UserRegistrationHelper.java`

### API ID: AUTH-008 — Load user details
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/loadUser`
- Purpose: Load a specific user record.
- Authentication: Conditional/public via config.
- Authorization: None explicit in controller; uses `user.id`.
- Controller: `UserController.loadUserDetails`
- Service: `UserService.loadUserDetails`
**Frontend usage**
- Suggested page: profile/account details.
- User action: open account page.
- Data required: user identifier.
- Related APIs: `AUTH-006`, `AUTH-009`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.userRegPld`.
**Success response:** `200 OK` with `responceObj` user payload and `status=success`.
**Error responses:** No explicit branch besides a failed response when `user.id` is absent.
**Business rules:** Reads a `User` from the DAO using the supplied ID.
**Source references:** `UserService.java`, `UserDao.java`

### API ID: AUTH-009 — Search users
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/search`
- Purpose: Search/filter users, with admin-level validation.
- Authentication: Conditional/public via config.
- Authorization: `validateSuperAdmin(user)` enforces admin/super-admin access.
- Controller: `UserController.search`
- Service: `UserService.search`
**Frontend usage**
- Suggested page: admin user management.
- User action: filter/search for users.
- Data required: filter criteria, pagination, sort parameters.
- Related APIs: `AUTH-010`, `AUTH-011`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Generic filter criteria payload plus optional pagination/sort metadata.
**Success response:** `200 OK` with `responceObj` user list and `status=success`.
**Error responses:** `200 OK` with `status=failed` when the caller is not a valid admin user.
**Business rules:** Uses `FilterCriteriaHelper`, `PaginationHelper`, and `SortBO` to build the result set.
**Source references:** `UserService.java`, `UserRegistrationHelper.java`, `FilterCriteriaHelper.java`

### API ID: AUTH-010 — Update user record
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/update-user`
- Purpose: Admin updates a user record.
- Authentication: Conditional/public via config.
- Authorization: Requires `validateSuperAdmin(loginUser)`.
- Controller: `UserController.updateUser`
- Service: `UserService.updateUser`
**Frontend usage**
- Suggested page: admin user edit form.
- User action: save changes to a user.
- Data required: target user data + admin token.
- Related APIs: `AUTH-009`, `AUTH-011`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.userRegPld` plus token payload.
**Success response:** `200 OK` with `status=success`.
**Error responses:** `200 OK` with validation payload when access or data is invalid.
**Business rules:** Updates email/mobile/name and password if present; de-activates no direct delete here.
**Source references:** `UserService.java`, `UserRegistrationHelper.java`

### API ID: AUTH-011 — Delete user
- Domain: Authentication
- Method: POST
- Endpoint: `/api/v1/user/delete-user`
- Purpose: Inactivate a user record.
- Authentication: Conditional/public via config.
- Authorization: Requires admin/super-admin access.
- Controller: `UserController.deleteUser`
- Service: `UserService.deleteUser`
**Frontend usage**
- Suggested page: admin user list.
- User action: deactivate a user.
- Data required: target user id.
- Related APIs: `AUTH-009`, `AUTH-010`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.userRegPld`
**Success response:** `200 OK` with `status=success`.
**Error responses:** `200 OK` with failed response if admin validation fails.
**Business rules:** Calls `UserRegistrationHelper.deleteUser(user)`, which sets `Status` to inactive.
**Source references:** `UserService.java`, `UserRegistrationHelper.java`

### API ID: HOME-001 — Feature category search
- Domain: Home
- Method: POST
- Endpoint: `/api/v1/home/feature-category`
- Purpose: Find featured category records according to filters/sort.
- Authentication: Conditional/public through default route rule.
- Authorization: Not enforced in controller.
- Controller: `HomeController.searchFeaturedCategory`
- Service: `HomeService.searchCategory`
**Frontend usage**
- Suggested page: landing page category tiles.
- User action: load home page.
- Data required: filter criteria and optional pagination.
- Related APIs: `HOME-003`, `FLAG-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Filter criteria/sort/pagination fields in `requestPayload`.
**Success response:** `200 OK`; result is serialized `MasterBO` as JSON.
**Error responses:** No explicit error contract found; method returns whatever `homeServiceHelper` yields.
**Business rules:** Uses `FilterCriteriaHelper`, `PaginationHelper`, and `DisplayProductHelper` to return category results.
**Source references:** `HomeController.java`, `HomeService.java`

### API ID: HOME-002 — Feature product search
- Domain: Home
- Method: POST
- Endpoint: `/api/v1/home/feature-products`
- Purpose: Search for featured products on the home page.
- Authentication: Conditional/public via config.
- Authorization: None explicit.
- Controller: `HomeController.searchFeaturedProducts`
- Service: `HomeService.searchFeatureProducts`
**Frontend usage**
- Suggested page: home landing/product highlights.
- User action: page load.
- Data required: filters and pagination metadata.
- Related APIs: `DISPLAY-001`, `HOME-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Generic search criteria in `requestPayload`.
**Success response:** `200 OK`; returns `MasterBO` as JSON.
**Error responses:** No dedicated exception contract.
**Business rules:** Uses `displayProductHelper.getProductsByFilterBOs(...)`.
**Source references:** `HomeController.java`, `HomeService.java`, `DisplayProductHelper.java`

### API ID: HOME-003 — Category list
- Domain: Home
- Method: GET
- Endpoint: `/api/v1/home/cat-list`
- Purpose: Load all categories for the home menu.
- Authentication: Conditional/public via config.
- Authorization: None explicit.
- Controller: `HomeController.loadCatList`
- Service: `HomeService.loadAllcategories`
**Frontend usage**
- Suggested page: navigation menu.
- User action: page render.
- Data required: none.
- Related APIs: `HOME-004`, `FLAG-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None explicitly required.
**Request body:** None.
**Success response:** `200 OK` with a `responceObj` payload containing category data.
**Error responses:** No custom error response found.
**Business rules:** Uses `homeServiceHelper.loadallFlagBos("CATEGORY")`.
**Source references:** `HomeController.java`, `HomeService.java`, `HomeServiceHelper.java`

### API ID: HOME-004 — Menus
- Domain: Home
- Method: GET
- Endpoint: `/api/v1/home/menus`
- Purpose: Return the menu structure with categories/subcategories.
- Authentication: Conditional/public via config.
- Authorization: None explicit.
- Controller: `HomeController.loadmenu`
- Service: `HomeService.loadMenu`
**Frontend usage**
- Suggested page: global storefront navigation.
- User action: render menu.
- Data required: none.
- Related APIs: `HOME-003`, `FLAG-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None.
**Request body:** None.
**Success response:** `200 OK` with menu payload.
**Error responses:** No custom error response found.
**Business rules:** Calls `flagServiceHelper.constructManuResponsePayload(flags)`.
**Source references:** `HomeController.java`, `HomeService.java`, `FlagServiceHelper.java`

### API ID: DISPLAY-001 — Product search
- Domain: Catalog
- Method: POST
- Endpoint: `/api/v1/displayproducts/search`
- Purpose: Search products with filter, sort, and pagination metadata.
- Authentication: Conditional/public via config.
- Authorization: none explicit; user identity may be passed in `tokenPayload` if present.
- Controller: `DisplayProductsController.searchProducts`
- Service: `DisplayProductService.search`
**Frontend usage**
- Suggested page: product listing and collection pages.
- User action: search/filter products.
- Data required: filter criteria, sort, pagination, optional user token.
- Related APIs: `DISPLAY-002`, `DISPLAY-005`, `HOME-002`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Generic request payload with filter criteria and pagination metadata.
**Success response:** `200 OK` with `responceObj` product list.
**Error responses:** None explicitly defined; service returns `status` if present or default payload.
**Business rules:** Uses `FilterCriteriaHelper.parseFilterCriteBOsByPayload`, `PaginationHelper.parsePaginationBOByPayload`, and `DisplayProductHelper.constructResponsePayload`.
**Source references:** `DisplayProductsController.java`, `DisplayProductService.java`

### API ID: DISPLAY-002 — Product-only search
- Domain: Catalog
- Method: POST
- Endpoint: `/api/v1/displayproducts/searchonlyproducts`
- Purpose: Return a reduced product-only payload optimized for product cards/filters.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `DisplayProductsController.searchOnlyProducts`
- Service: `DisplayProductService.productOnlySearch`
**Frontend usage**
- Suggested page: faceted filtering or grid rendering.
- User action: filtered product listing.
- Data required: same as `DISPLAY-001`.
- Related APIs: `DISPLAY-001`, `DISPLAY-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Same generic payload contract as search endpoints.
**Success response:** `200 OK` with `responceObj` containing product-only search results.
**Error responses:** No custom error response discovered.
**Business rules:** Reuses the same product search helper but builds a different response structure.
**Source references:** `DisplayProductService.java`, `DisplayProductHelper.java`

### API ID: DISPLAY-003 — Download products Excel
- Domain: Catalog
- Method: POST
- Endpoint: `/api/v1/displayproducts/download/excel`
- Purpose: Export the search result product collection as an `.xlsx` file.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `DisplayProductsController.downloadProductsExcel`
- Service: `DisplayProductService.search`
**Frontend usage**
- Suggested page: admin product export screen.
- User action: click export.
- Data required: product search payload, `reportNameTag` and generated header array.
- Related APIs: `DISPLAY-001`, `REPORT-002`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`, `Content-Disposition` response header is set.
**Request body:** Search payload used to determine product dataset and report title.
**Success response:** `200 OK` with Excel file (`application/vnd.ms-excel`).
**Error responses:** None explicit; server will respond with default Spring errors if payload is malformed.
**Business rules:** Builds `FileWriteBO` and uses `ExcelGenrator` to create the file.
**Source references:** `DisplayProductsController.java`, `FilewriterUtill.java`, `ExcelGenrator.java`

### API ID: DISPLAY-004 — Download products PDF
- Domain: Catalog
- Method: POST
- Endpoint: `/api/v1/displayproducts/download/pdf`
- Purpose: Export the current product search to PDF.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `DisplayProductsController.downloadProductsPdf`
- Service: `DisplayProductService.search`
**Frontend usage**
- Suggested page: admin report/export screen.
- User action: export current product dataset.
- Data required: same as `DISPLAY-003`.
- Related APIs: `DISPLAY-003`, `REPORT-003`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Search payload and report metadata.
**Success response:** `200 OK` with `application/pdf` attachment.
**Error responses:** Default Spring error handling only.
**Business rules:** Uses `PdfGenrater` to create the PDF.
**Source references:** `DisplayProductsController.java`, `PdfGenrater.java`

### API ID: DISPLAY-005 — Product by ID
- Domain: Catalog
- Method: GET
- Endpoint: `/api/v1/displayproducts/find/{id}`
- Purpose: Fetch a product record by numeric ID.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `DisplayProductsController.searchProductById`
- Service: `DisplayProductService.findProductById`
**Frontend usage**
- Suggested page: product detail page.
- User action: open product detail by ID.
- Data required: `id` path parameter.
- Related APIs: `DISPLAY-001`, `HOME-002`.
**Path parameters:** `id` (Integer, required)
**Query parameters:** None
**Request headers:** None explicitly required.
**Request body:** None.
**Success response:** `200 OK` with JSON payload containing `product` object.
**Error responses:** None explicit.
**Business rules:** Converts a `Product` entity to a `JSONObject` via `DisplayProductHelper.convertJSONObjectProduct`.
**Source references:** `DisplayProductsController.java`, `DisplayProductService.java`

### API ID: DISPLAY-006 — Download SKU Excel
- Domain: Catalog
- Method: POST
- Endpoint: `/api/v1/displayproducts/download/skus/excel`
- Purpose: Export SKU rows from product search results to Excel.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `DisplayProductsController.downloadSkusExcel`
- Service: `DisplayProductService.search`
**Frontend usage**
- Suggested page: SKU management/report export.
- User action: export SKUs.
- Data required: product search payload.
- Related APIs: `DISPLAY-003`, `PRODUCT-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Search payload with `reportNameTag` and result set.
**Success response:** `200 OK` with Excel attachment; file name derived from `reportNameTag`.
**Error responses:** Default general errors only.
**Business rules:** Reads `skus` array from the response object and writes it to an Excel sheet.
**Source references:** `DisplayProductsController.java`

### API ID: DISPLAY-007 — Download SKU PDF
- Domain: Catalog
- Method: POST
- Endpoint: `/api/v1/displayproducts/download/skus/pdf`
- Purpose: Export SKU rows from product search to PDF.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `DisplayProductsController.downloadSkusPdf`
- Service: `DisplayProductService.search`
**Frontend usage**
- Suggested page: SKU management/report export.
- User action: export SKUs.
- Data required: search payload.
- Related APIs: `DISPLAY-006`, `PRODUCT-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Search payload used to calculate report columns and rows.
**Success response:** `200 OK` with PDF attachment.
**Error responses:** Default Spring errors only.
**Business rules:** Same export flow as `DISPLAY-006` but PDF output.
**Source references:** `DisplayProductsController.java`, `PdfGenrater.java`

### API ID: PRODUCT-001 — Add product
- Domain: Product admin
- Method: POST
- Endpoint: `/api/v2/setupproduct/add`
- Purpose: Create or update product data including category, subcategory, status, and variants.
- Authentication: Conditional/public via config.
- Authorization: Business logic resolves `User` from `tokenPayload` and attaches it to the product; no explicit role restriction in controller.
- Controller: `ProductController.addProduct`
- Service: `ProductService.saveOrUpdate`
**Frontend usage**
- Suggested page: admin product form.
- User action: save a product.
- Data required: product payload (`productPld`), product image list, variants, SKU fields.
- Related APIs: `PRODUCT-002`, `PRODUCT-003`, `FILE-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.productPld` with product + variant fields such as `productName`, `searchName`, `categoryId`, `subCategoryId`, `shortDesc`, `description`, `units`, `stock`, `status`, `isNew`, `price`, and `variants`.
**Success response:** `200 OK` with `status=success` in `responceObj`.
**Error responses:** `200 OK` with `status=failed` and error payload if validation fails.
**Business rules:** Performs `productServiceHelper.checkProductErrors(...)` before saving.
**Source references:** `ProductController.java`, `ProductService.java`, `ProductServiceHelper.java`

### API ID: PRODUCT-002 — Delete SKU
- Domain: Product admin
- Method: POST
- Endpoint: `/api/v2/setupproduct/delete-sku`
- Purpose: Delete a product SKU.
- Authentication: Conditional/public via config.
- Authorization: none explicit in controller, but user is resolved from token and attached to payload.
- Controller: `ProductController.deleteSKU`
- Service: `ProductService.deleteSku`
**Frontend usage**
- Suggested page: product variant editor.
- User action: remove an SKU.
- Data required: `productPld` containing product/SKU identity.
- Related APIs: `PRODUCT-001`, `PRODUCT-003`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.productPld`
**Success response:** `200 OK` with `status=success`.
**Error responses:** `200 OK` with failed error payload when validation fails.
**Business rules:** Calls `checkDeleteSKUErrors` before deletion.
**Source references:** `ProductController.java`, `ProductService.java`, `ProductServiceHelper.java`

### API ID: PRODUCT-003 — Delete product
- Domain: Product admin
- Method: POST
- Endpoint: `/api/v2/setupproduct/delete`
- Purpose: Delete a whole product record.
- Authentication: Conditional/public via config.
- Authorization: none explicit, but `ProductService.deleteProduct` loads the authenticated user and validates.
- Controller: `ProductController.deleteProduct`
- Service: `ProductService.deleteProduct`
**Frontend usage**
- Suggested page: product admin listing.
- User action: remove product from catalog.
- Data required: product id and potentially parent product record attributes.
- Related APIs: `PRODUCT-001`, `PRODUCT-002`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.productPld`
**Success response:** `200 OK` with `status=success`.
**Error responses:** `200 OK` with `status=failed` plus error payload.
**Business rules:** Uses `checkDeleteProductErrors` and `productServiceHelper.deleteProduct(...)`.
**Source references:** `ProductController.java`, `ProductService.java`, `ProductServiceHelper.java`

### API ID: FILE-001 — Upload media and return metadata
- Domain: File management
- Method: POST
- Endpoint: `/api/v1/fileUpload/upload`
- Purpose: Upload an image to the configured image folder and return file metadata.
- Authentication: Conditional/public by route rule.
- Authorization: none.
- Controller: `FileUploadController.uploadFile`
- Service: `FileUploadController` (controller-local logic)
**Frontend usage**
- Suggested page: image upload in admin product form.
- User action: upload product image.
- Data required: `MultipartFile file`.
- Related APIs: `FILE-002`, `PRODUCT-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `multipart/form-data` with file part named `file`.
**Request body:** Multipart file upload, not JSON.
**Success response:** `200 OK` with JSON `responceObj` including `status`, `fileName`, and `actualName`.
**Error responses:** Returns string `No file attached` for empty uploads; otherwise catches `IOException`.
**Business rules:** Writes file to a configured path, resizes image to 1000x800, and stores the generated file name.
**Source references:** `FileUploadController.java`, `MetaConfigHelper.java`, `ImageCompressor.java`

### API ID: FILE-002 — Product upload by filename
- Domain: File management
- Method: POST
- Endpoint: `/api/v1/fileUpload/productUpload/{fileName}`
- Purpose: Attach a previously uploaded file to product data.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `FileUploadController.productUpload`
- Service: `ProductService.productUpload`
**Frontend usage**
- Suggested page: admin product save flow after media upload.
- User action: submit uploaded file name.
- Data required: `fileName` path variable.
- Related APIs: `FILE-001`, `PRODUCT-001`.
**Path parameters:** `fileName` (String, required)
**Query parameters:** None
**Request headers:** None explicitly required.
**Request body:** None.
**Success response:** `200 OK` with a status string from `ProductService.productUpload`.
**Error responses:** none custom.
**Business rules:** Reads the file with `ExcelReader.genrateFileReadBOFromFile(fileName)` and validates it before processing.
**Source references:** `FileUploadController.java`, `ProductService.java`, `ExcelReader.java`

### API ID: CART-001 — Add cart item
- Domain: Cart
- Method: POST
- Endpoint: `/api/v2/cart/add`
- Purpose: Add a single SKU to the current authenticated user's cart.
- Authentication: Conditional/public via config.
- Authorization: `User` is resolved from `tokenPayload` in the request.
- Controller: `CartController.addCart`
- Service: `CartService.saveOrUpdate`
**Frontend usage**
- Suggested page: product detail cart button; mini-cart add.
- User action: add item to cart.
- Data required: `skuId`, `qty`, `units` and user token.
- Related APIs: `CART-002`, `CART-004`, `ORDER-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.cartArrayPld` or a single `Jcart` equivalent; actual parser reads `cartId`, `skuId`, `qty`, `units`.
**Success response:** `200 OK` and payload set to `"true"` after successful save.
**Error responses:** No explicit error model besides early return on validation errors.
**Business rules:** Validates that a valid `skuId` exists; merges with existing cart item if same SKU/user match.
**Source references:** `CartController.java`, `CartService.java`, `CartServiceHelper.java`

### API ID: CART-002 — Add multiple cart items
- Domain: Cart
- Method: POST
- Endpoint: `/api/v2/cart/addall`
- Purpose: Add an array of cart entries in a batch.
- Authentication: Conditional/public via config.
- Authorization: user is resolved from the token payload.
- Controller: `CartController.addAllCart`
- Service: `CartService.saveAll`
**Frontend usage**
- Suggested page: bulk cart import/quick add.
- User action: add multiple products.
- Data required: array `cartArrayPld` with item objects.
- Related APIs: `CART-001`, `CART-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** JSON array under `requestPayload.cartArrayPld`.
**Success response:** `200 OK` with `status=success`.
**Error responses:** No dedicated error contract.
**Business rules:** Saves each cart row for the user.
**Source references:** `CartService.java`, `CartServiceHelper.java`

### API ID: CART-003 — Delete cart item
- Domain: Cart
- Method: POST
- Endpoint: `/api/v2/cart/delete`
- Purpose: Remove an item from the current user's cart.
- Authentication: Conditional/public via config.
- Authorization: user is resolved from `tokenPayload` and used in validation.
- Controller: `CartController.deleteCart`
- Service: `CartService.deleteCart`
**Frontend usage**
- Suggested page: cart summary or mini-cart.
- User action: remove line item.
- Data required: cart `id` and user token.
- Related APIs: `CART-001`, `CART-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` containing one cart item with `cartId`, `skuId` etc.
**Success response:** `200 OK` with payload `"true"`.
**Error responses:** None explicit beyond validation failure.
**Business rules:** Requires cart item id to exist; deletes Jcart row.
**Source references:** `CartService.java`, `CartServiceHelper.java`

### API ID: CART-004 — Search cart
- Domain: Cart
- Method: POST
- Endpoint: `/api/v2/cart/search`
- Purpose: Fetch the authenticated user's cart and optional filtered results.
- Authentication: Conditional/public via config.
- Authorization: uses `user` from token for filtering.
- Controller: `CartController.searchCart`
- Service: `CartService.searchCart`
**Frontend usage**
- Suggested page: shopping cart page.
- User action: load cart summary.
- Data required: filter criteria, pagination, and the user token.
- Related APIs: `CART-001`, `ORDER-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Generic filter criteria in `requestPayload`.
**Success response:** `200 OK` with `responceObj` containing cart data.
**Error responses:** No dedicated error contract.
**Business rules:** Uses `JCartSpecification` with a user filter and sort order.
**Source references:** `CartService.java`, `CartServiceHelper.java`

### API ID: WISHLIST-001 — Add wishlist item
- Domain: Wishlist
- Method: POST
- Endpoint: `/api/v2/wishlist/add`
- Purpose: Add a product or SKU to the user's wishlist.
- Authentication: Conditional/public via config.
- Authorization: user resolved from token.
- Controller: `WishlistController.addWishList`
- Service: `WishlistService.saveOrUpdate`
**Frontend usage**
- Suggested page: product detail page/wishlist.
- User action: save product to wishlist.
- Data required: `wishListArrayPld` or equivalent single object with `skuId`, `qty`, `units`.
- Related APIs: `WISHLIST-004`, `DISPLAY-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with `wishListArrayPld` / single wishlist entry.
**Success response:** `200 OK` with `responceObj` containing saved wishlist entity.
**Error responses:** None explicitly declared.
**Business rules:** Validates wishlist item integrity before save.
**Source references:** `WishlistController.java`, `WishlistService.java`, `WishlistServiceHelper.java`

### API ID: WISHLIST-002 — Add multiple wishlist items
- Domain: Wishlist
- Method: POST
- Endpoint: `/api/v2/wishlist/addall`
- Purpose: Save a batch of wishlist entries in one call.
- Authentication: Conditional/public via config.
- Authorization: user resolved from token.
- Controller: `WishlistController.addAllWishList`
- Service: `WishlistService.saveAll`
**Frontend usage**
- Suggested page: imports or multi-select save flows.
- User action: save multiple products to wishlist.
- Data required: array under `wishListArrayPld`.
- Related APIs: `WISHLIST-001`, `WISHLIST-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Batch array in `requestPayload.wishListArrayPld`.
**Success response:** `200 OK` with `status=success` and `responceObj`.
**Error responses:** No explicit custom schema.
**Business rules:** Saves all items serially and emits success payload if validation passes.
**Source references:** `WishlistService.java`

### API ID: WISHLIST-003 — Delete wishlist item
- Domain: Wishlist
- Method: POST
- Endpoint: `/api/v2/wishlist/delete`
- Purpose: Remove a wishlist row.
- Authentication: Conditional/public via config.
- Authorization: user resolved from token.
- Controller: `WishlistController.deleteWishList`
- Service: `WishlistService.deleteWishList`
**Frontend usage**
- Suggested page: wishlist summary screen.
- User action: remove favorite product.
- Data required: wishlist id or equivalent product identity.
- Related APIs: `WISHLIST-001`, `WISHLIST-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with `wishListId` or equivalent fields.
**Success response:** `200 OK` with payload `"true"`.
**Error responses:** None explicit.
**Business rules:** Requires item id and deletes the row.
**Source references:** `WishlistService.java`, `WishlistServiceHelper.java`

### API ID: WISHLIST-004 — Search wishlist
- Domain: Wishlist
- Method: POST
- Endpoint: `/api/v2/wishlist/search`
- Purpose: List wishlist items for the current user with optional filters.
- Authentication: Conditional/public via config.
- Authorization: user resolved from the token payload.
- Controller: `WishlistController.searchWishList`
- Service: `WishlistService.searchWishList`
**Frontend usage**
- Suggested page: wishlist page.
- User action: open saved items.
- Data required: user token and maybe filter criteria.
- Related APIs: `WISHLIST-001`, `DISPLAY-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Search criteria payload.
**Success response:** `200 OK` with wishlist payload in `responceObj`.
**Error responses:** None explicit.
**Business rules:** Uses `FilterCriteriaHelper` and `PaginationHelper` to query wishlist rows filtered by user. 
**Source references:** `WishlistService.java`, `WishlistServiceHelper.java`

### API ID: FLAG-001 — Add flag/category
- Domain: Admin taxonomy
- Method: POST
- Endpoint: `/api/v1/flag/add`
- Purpose: Create a category or subcategory metadata record.
- Authentication: Conditional/public via config.
- Authorization: none explicit in controller.
- Controller: `FlagController.addFlag`
- Service: `FlagService.saveOrUpdate`
**Frontend usage**
- Suggested page: category admin form.
- User action: save category/subcategory.
- Data required: `flagPld`, optional `filePld`, `name`, `flagtype`, `parentFlag`, `description`.
- Related APIs: `FLAG-005`, `HOME-003`, `SEO-003`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.flagPld` plus optional file payload.
**Success response:** `200 OK` with `responceObj.flag` payload.
**Error responses:** No explicit custom contract.
**Business rules:** Saves flags and optional image.
**Source references:** `FlagController.java`, `FlagService.java`, `FlagServiceHelper.java`

### API ID: FLAG-002 — Update flag/category
- Domain: Admin taxonomy
- Method: POST
- Endpoint: `/api/v1/flag/update`
- Purpose: Update a category or subcategory metadata row.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `FlagController.updateFlag`
- Service: `FlagService.saveOrUpdate`
**Frontend usage**
- Suggested page: category management.
- User action: edit saved category.
- Data required: `flagPld` with ID and updated fields.
- Related APIs: `FLAG-001`, `FLAG-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Same as `FLAG-001` with ID included.
**Success response:** `200 OK` with updated flag JSON.
**Error responses:** No custom error format discovered.
**Business rules:** Save-or-update path for `Flag` object.
**Source references:** `FlagService.java`, `FlagServiceHelper.java`

### API ID: FLAG-003 — Delete flag/category
- Domain: Admin taxonomy
- Method: POST
- Endpoint: `/api/v1/flag/delete`
- Purpose: Delete a category or category tree node.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `FlagController.deleteFlag`
- Service: `FlagService.deleteFlag`
**Frontend usage**
- Suggested page: admin category list.
- User action: remove category.
- Data required: `flagPld` with id.
- Related APIs: `FLAG-001`, `FLAG-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.flagPld`.
**Success response:** `200 OK` with plain string `Deleted`.
**Error responses:** No explicit error contract.
**Business rules:** Calls `FlagServiceHelper.deleteFlag(flag)`.
**Source references:** `FlagController.java`, `FlagService.java`, `FlagServiceHelper.java`

### API ID: FLAG-004 — Search flags
- Domain: Admin taxonomy
- Method: POST
- Endpoint: `/api/v1/flag/search`
- Purpose: Fetch flags using criteria, pagination, and sorting.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `FlagController.searchFlag`
- Service: `FlagService.searchFlag`
**Frontend usage**
- Suggested page: admin taxonomy tree.
- User action: search categories.
- Data required: filter criteria and pagination metadata.
- Related APIs: `FLAG-005`, `HOME-003`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Generic filter payload.
**Success response:** `200 OK` with `responceObj` flag data.
**Error responses:** No dedicated error contract.
**Business rules:** Uses `FlagSpecification` and `PaginationHelper`.
**Source references:** `FlagService.java`, `FlagServiceHelper.java`

### API ID: FLAG-005 — Load all flags
- Domain: Admin taxonomy
- Method: GET
- Endpoint: `/api/v1/flag/all`
- Purpose: Return every flag/category record.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `FlagController.loadFlags`
- Service: `FlagService.loadFlags`
**Frontend usage**
- Suggested page: category menu.
- User action: page render / category selection.
- Data required: none.
- Related APIs: `HOME-003`, `SEO-003`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None.
**Request body:** None.
**Success response:** `200 OK` with a `responceObj` flag list.
**Error responses:** None discovered.
**Business rules:** Calls `getFlagsByFilterBOs(null,null,null,null)` and wraps it in `constructResponsePayload`.
**Source references:** `FlagController.java`, `FlagService.java`, `FlagServiceHelper.java`

### API ID: ORDER-001 — Find sale by bill number
- Domain: Orders
- Method: POST
- Endpoint: `/api/v2/sale/find`
- Purpose: Return order details for a bill number.
- Authentication: Conditional/public via config.
- Authorization: `MasterUtil.getUserByToken(tokenPayload)` resolves the acting user and restricts the lookup.
- Controller: `SaleController.findSaleByBillNumber`
- Service: `SaleService.findSaleDetailsById`
**Frontend usage**
- Suggested page: order details page.
- User action: open order summary.
- Data required: `billNumber` and user token.
- Related APIs: `ORDER-006`, `REPORT-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with `billNumber` and optional token payload.
**Success response:** `200 OK` with `responceObj` built from `SaleMasterBO`.
**Error responses:** `status=failed` if a sale is not found or access is invalid.
**Business rules:** Uses `saleServiceHelper.readSaleMasterBySaleNumber(...)`.
**Source references:** `SaleController.java`, `SaleService.java`, `SaleServiceHelper.java`

### API ID: ORDER-002 — Update delivery status
- Domain: Orders
- Method: POST
- Endpoint: `/api/v2/sale/delivery`
- Purpose: Move an order to a new delivery state and notify by email.
- Authentication: Conditional/public via config.
- Authorization: Allowed only for `ADMIN` or `SUPER_ADMIN` roles in `SaleService.saveDelivery`.
- Controller: `SaleController.delivery`
- Service: `SaleService.saveDelivery`
**Frontend usage**
- Suggested page: admin order fulfillment dashboard.
- User action: update delivery status for an order.
- Data required: `saleItemsPld`, `deliveryStatus`, `additionalInfo`, and admin token.
- Related APIs: `ORDER-001`, `REPORT-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with `saleItemsPld` and `deliveryStatus`.
**Success response:** `200 OK` with `responceObj.status=success`.
**Error responses:** `status=failed` when role or item list validation fails.
**Business rules:** Validates admin role and list of sale items before update; sends mail on status change.
**Source references:** `SaleService.java`, `SaleServiceHelper.java`, `EmailService.java`

### API ID: ORDER-003 — Cancel order
- Domain: Orders
- Method: POST
- Endpoint: `/api/v2/sale/cancel`
- Purpose: Cancel a customer order, applying the cancelled delivery status and remarks.
- Authentication: Conditional/public via config.
- Authorization: business logic validates the current user and the order item set.
- Controller: `SaleController.cancelOrder`
- Service: `SaleService.cancelOrder`
**Frontend usage**
- Suggested page: order cancellation action on customer/admin pages.
- User action: cancel order.
- Data required: `billNumber`, `additionalInfo.cancelRemarks`, user token.
- Related APIs: `ORDER-001`, `ORDER-002`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with `billNumber` and `additionalInfo`.
**Success response:** `200 OK` with `status=success`.
**Error responses:** `status=failed` with validation payload on errors.
**Business rules:** Uses `MetaConfig.DLY_CANCELLED_NAME` and may send an email for the new state.
**Source references:** `SaleService.java`, `SaleServiceHelper.java`

### API ID: ORDER-004 — Create new sale/order
- Domain: Orders
- Method: POST
- Endpoint: `/api/v2/sale/newsale`
- Purpose: Create a new order from the cart, address, payment, and coupon data.
- Authentication: Conditional/public via config.
- Authorization: user is resolved from the token payload.
- Controller: `SaleController.sale`
- Service: `SaleService.newSale`
**Frontend usage**
- Suggested page: checkout confirmation and order submission.
- User action: submit checkout form.
- Data required: cart items, address, payment object, additional charges, optional coupon.
- Related APIs: `CART-004`, `ORDER-001`, `PAYMENT-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with sale items, additional charges, address, payment, coupon details.
**Success response:** `200 OK` with `billNumber` in `responceObj` and `status=success`.
**Error responses:** `status=failed` with error payload.
**Business rules:** Validates the cart and sale object before generating a sale and notifying by email.
**Source references:** `SaleService.java`, `SaleServiceHelper.java`, `EmailService.java`

### API ID: ORDER-005 — Apply coupon
- Domain: Orders
- Method: POST
- Endpoint: `/api/v2/sale/applycoupon`
- Purpose: Apply a coupon code to the current cart/order context.
- Authentication: Conditional/public via config.
- Authorization: user from token payload.
- Controller: `SaleController.applyCoupon`
- Service: `SaleService.applyCoupon`
**Frontend usage**
- Suggested page: checkout coupon section.
- User action: apply discount code.
- Data required: `couponCode` and user/cart context.
- Related APIs: `ORDER-004`, `PAYMENT-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with `couponCode` and (implicitly) cart context.
**Success response:** `200 OK` with response payload returned by service.
**Error responses:** No explicit custom contract discovered; likely returns validation errors.
**Business rules:** Uses `saleServiceHelper.findCouponByCode` and discount calculations.
**Source references:** `SaleService.java`, `SaleServiceHelper.java`

### API ID: ORDER-006 — Download order PDF
- Domain: Orders
- Method: POST
- Endpoint: `/api/v2/sale/orderDetails/pdf`
- Purpose: Generate and download a PDF invoice/order copy.
- Authentication: Conditional/public via config.
- Authorization: user token is required to resolve the order.
- Controller: `SaleController.downloadProductsPdf`
- Service: `SaleService.genrateBillPdf`
**Frontend usage**
- Suggested page: order history / invoice download.
- User action: download an order copy.
- Data required: `billNumber` and user token.
- Related APIs: `ORDER-001`, `ORDER-004`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with `billNumber`.
**Success response:** `200 OK` with PDF attachment.
**Error responses:** None explicit.
**Business rules:** Creates an HTML/PDF order document using `HTMLToPdfGenerater` and `FilesUtil`.
**Source references:** `SaleService.java`, `HTMLToPdfGenerater.java`

### API ID: ORDER-007 — Bat job sale detail refresh
- Domain: Orders/background job
- Method: POST
- Endpoint: `/api/v2/batjob/saleDetail/{id}`
- Purpose: Trigger a background summary update for a sale detail row by sale ID.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `Batjobcontroller.runBatjobSaleDetailById`
- Service: `SaleDetailedService.onSaleSaveSaleDetailed`
**Frontend usage**
- Recommended only as internal/admin automation; not an end-user UI endpoint.
- User action: internal task trigger, not a regular page flow.
- Data required: sale `id` path parameter.
- Related APIs: `REPORT-001`, `ORDER-002`.
**Path parameters:** `id` (Integer, required)
**Query parameters:** None
**Request headers:** None explicitly required.
**Request body:** None.
**Success response:** `200 OK` with plain string `success`.
**Error responses:** None explicit.
**Business rules:** Builds a minimal `Sale` object, then updates the sale-detail snapshot.
**Source references:** `Batjobcontroller.java`, `SaleDetailedService.java`

### API ID: REPORT-001 — Sale detail search
- Domain: Reporting
- Method: POST
- Endpoint: `/api/v2/salereport/saledetail/search`
- Purpose: Search sale-detail rows with filters, sorting, and pagination.
- Authentication: Conditional/public via config.
- Authorization: business logic resolves the user and uses search criteria.
- Controller: `SaleReportController.searchSale`
- Service: `SaleDetailedService.searchSaleDetail`
**Frontend usage**
- Suggested page: sales report dashboard.
- User action: filter/search orders by sales detail criteria.
- Data required: filter payload, pagination, sort, user token.
- Related APIs: `REPORT-002`, `REPORT-003`, `ORDER-002`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Generic filter criteria payload.
**Success response:** `200 OK` with `responceObj` containing sales detail data.
**Error responses:** None explicit.
**Business rules:** Uses `SaleDetailedServiceHelper.getSaleDetailBySearchCriteria(...)`.
**Source references:** `SaleReportController.java`, `SaleDetailedService.java`

### API ID: REPORT-002 — Download sale report Excel
- Domain: Reporting
- Method: POST
- Endpoint: `/api/v2/salereport/download/excel`
- Purpose: Export the filtered sale-detail dataset to Excel.
- Authentication: Conditional/public via config.
- Authorization: none explicit in controller.
- Controller: `SaleReportController.downloadOrdersExcel`
- Service: `SaleDetailedService.searchSaleDetail`
**Frontend usage**
- Suggested page: report export action.
- User action: export sales report.
- Data required: report filter payload and `reportNameTag`.
- Related APIs: `REPORT-001`, `REPORT-003`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`, plus `Content-Disposition` response header.
**Request body:** Search criteria in request payload.
**Success response:** `200 OK` with Excel attachment.
**Error responses:** none explicit.
**Business rules:** Reads `saleDetails` array from `responceObj` and writes it to a file.
**Source references:** `SaleReportController.java`, `FilewriterUtill.java`

### API ID: REPORT-003 — Download sale report PDF
- Domain: Reporting
- Method: POST
- Endpoint: `/api/v2/salereport/download/pdf`
- Purpose: Export the filtered sale-detail dataset to PDF.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `SaleReportController.downloadProductsPdf`
- Service: `SaleDetailedService.searchSaleDetail`
**Frontend usage**
- Suggested page: report export action.
- User action: export PDF.
- Data required: filter payload and report metadata.
- Related APIs: `REPORT-001`, `REPORT-002`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** Search criteria payload.
**Success response:** `200 OK` with PDF attachment.
**Error responses:** none explicit.
**Business rules:** Generates PDF from the filtered sale details array.
**Source references:** `SaleReportController.java`, `PdfGenrater.java`

### API ID: PAYMENT-001 — Create Stripe payment
- Domain: Payment
- Method: POST
- Endpoint: `/api/v2/payment/stripe/create-payment`
- Purpose: Create a Stripe charge using a payment token and cart data.
- Authentication: Conditional/public via config.
- Authorization: user is resolved from token payload, then the cart and sale data are linked to the user.
- Controller: `StripeController.createPayment`
- Service: `StripeService.createPayment`
**Frontend usage**
- Suggested page: checkout payment step.
- User action: pay with Stripe token.
- Data required: `paymentTokenId`, address, additional charges, cart, coupon, and user token.
- Related APIs: `CART-004`, `ORDER-004`, `ORDER-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload` with `tokenId`, `additionalCharges`, address details, coupon and other purchase metadata.
**Success response:** `200 OK`, depending on outcome, with `status` values such as `succeeded`, `pending`, or `failed`.
**Error responses:** `status=failed` with error payload in the catch block when Stripe exception occurs.
**Business rules:** Calculates the total, applies coupon discount, creates Stripe `Charge`, and if successful calls `saleService.newSale(payload)`.
**Source references:** `StripeController.java`, `StripeService.java`

### API ID: META-001 — Load metadata JSON by id
- Domain: Metadata
- Method: GET
- Endpoint: `/api/v1/meta/find/{id}`
- Purpose: Load stored metadata JSON by an ID.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `MetaController.findMetaData`
- Service: `MetaService.loadMetaJsonbyId`
**Frontend usage**
- Suggested page: configuration-driven UI materialization.
- User action: fetch metadata object.
- Data required: `id` path parameter.
- Related APIs: `META-002`, `META-004`.
**Path parameters:** `id` (String, required)
**Query parameters:** None
**Request headers:** None
**Request body:** None
**Success response:** `200 OK` with raw metadata JSON payload.
**Error responses:** None explicit.
**Business rules:** Looks up `MetaJson` entity by ID. Returns a JSON array from the stored value.
**Source references:** `MetaController.java`, `MetaService.java`, `MetaJsonDao.java`

### API ID: META-002 — Shipping charge metadata
- Domain: Metadata
- Method: GET
- Endpoint: `/api/v1/meta/shipments`
- Purpose: Load shipping/additional charge metadata.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `MetaController.shippingDetails`
- Service: `MetaService.shippingAdditionalCharges`
**Frontend usage**
- Suggested page: checkout shipping charge display.
- User action: load shipping cost settings.
- Data required: none.
- Related APIs: `ORDER-004`, `PAYMENT-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None.
**Request body:** None.
**Success response:** `200 OK` with configured shipping charges in `responceObj`.
**Error responses:** no custom error contract.
**Business rules:** Loads `Tag` rows of type `SHIPPING_CHARGES` plus config properties.
**Source references:** `MetaController.java`, `MetaService.java`, `MetaHelper.java`

### API ID: META-003 — Image maintenance test endpoint
- Domain: Metadata
- Method: GET
- Endpoint: `/api/v1/meta/test`
- Purpose: Resize image files in-place as a maintenance/test action.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `MetaController.test`
- Service: none; controller performs maintenance directly.
**Frontend usage**
- Not an expected user-facing API; developer/maintenance use only.
- Related APIs: `FILE-001`, `META-006`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None.
**Request body:** None.
**Success response:** `200 OK` with empty body.
**Error responses:** none explicit; method catches exceptions per-file.
**Business rules:** Reads all `SkuPicture` records, resizes images, and updates files.
**Source references:** `MetaController.java`, `ImageCompressor.java`

### API ID: META-004 — Refresh variables
- Domain: Metadata
- Method: GET
- Endpoint: `/api/v1/meta/refresh-variables`
- Purpose: Refresh configuration variables from the metadata/config layer.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `MetaController.refreshVariables`
- Service: `MetaService.refreshVariables`
**Frontend usage**
- Operational endpoint; not likely a customer-facing UI route.
- Related APIs: `META-002`, `META-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None.
**Request body:** None.
**Success response:** `200 OK` with `status=suucess` (typo in the code).
**Error responses:** none explicit.
**Business rules:** Calls `metaConfigHelper.refreshVariables()`.
**Source references:** `MetaController.java`, `MetaService.java`, `MetaConfigHelper.java`

### API ID: META-005 — SEO-friendly search key update
- Domain: Metadata
- Method: GET
- Endpoint: `/api/v1/meta/searchkey-seo-friendly`
- Purpose: Replace product `searchKey` values with URL-safe strings.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `MetaController.searchKeyReplaceHypen`
- Service: none; controller logic updates persisted `Product` records.
**Frontend usage**
- Internal maintenance endpoint; not a browser-facing API.
- Related APIs: `SEO-002`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None.
**Request body:** None.
**Success response:** `200 OK` with plain string `Success`.
**Error responses:** no custom contract.
**Business rules:** Rewrites the URL slug from the product's `searchKey` field, replacing non-alphanumeric characters with `-`.
**Source references:** `MetaController.java`, `ProductDao.java`

### API ID: META-006 — Rename file SEO-friendly
- Domain: Metadata
- Method: GET
- Endpoint: `/api/v1/meta/rename-file-seo-friendly`
- Purpose: Copy and rename image files to a SEO-friendly naming convention.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `MetaController.renameFileSeoFriendly`
- Service: none; controller performs file operations directly.
**Frontend usage**
- Internal maintenance endpoint; not normal storefront behavior.
- Related APIs: `FILE-001`, `META-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None.
**Request body:** None.
**Success response:** `200 OK` with empty body.
**Error responses:** catches exceptions and prints stack traces; no custom contract.
**Business rules:** Copies files from the configured path to another directory and updates image URLs in the database.
**Source references:** `MetaController.java`, `SkuPictureDao.java`

### API ID: NOTIFICATION-001 — Customer idle notification
- Domain: Notification
- Method: POST
- Endpoint: `/api/v1/notification/customer`
- Purpose: Detect inactive customers and send an idle-notification email.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `NotificationController.customerIdleNotification`
- Service: `NotificationService.customerIdleNotification`
**Frontend usage**
- Internal/customer-support workflow; not a normal storefront route.
- User action: trigger reminder to a customer.
- Data required: `userName` in `requestPayload`.
- Related APIs: `AUTH-001`, `AUTH-002`, `ORDER-001`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** `Content-Type: application/json`
**Request body:** `requestPayload.userName`.
**Success response:** `200 OK` with `status=success`.
**Error responses:** none explicit.
**Business rules:** Looks up the user by username and role then sends idle email only when the customer has zero sales.
**Source references:** `NotificationController.java`, `NotificationService.java`

### API ID: SEO-001 — Sitemap index
- Domain: SEO
- Method: GET
- Endpoint: `/sitemap.xml`
- Purpose: Return the sitemap index that references the product and pages sitemap files.
- Authentication: Not required; route is outside API namespace and explicitly listed in `publicUrls`.
- Authorization: none.
- Controller: `SitemapController.sitemap`
- Service: none; XML-building logic in controller.
**Frontend usage**
- Search-engine indexing.
- User action: crawling by bots.
- Data required: none.
- Related APIs: `SEO-002`, `SEO-003`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** Accepts XML response type.
**Request body:** None.
**Success response:** `200 OK` with `application/xml` content.
**Error responses:** none explicit.
**Business rules:** Creates a `SiteMapIndex` linking `/product-sitemap.xml` and `/pages-sitemap.xml`.
**Source references:** `SitemapController.java`

### API ID: SEO-002 — Product sitemap
- Domain: SEO
- Method: GET
- Endpoint: `/product-sitemap.xml`
- Purpose: Return product URLs in sitemap format.
- Authentication: Not required.
- Authorization: none.
- Controller: `SitemapController.productSiteMap`
- Service: none; controller uses `DisplayProductHelper.getProductsByFilterBOs(...)`.
**Frontend usage**
- Search engine indexing of product pages.
- User action: crawler access.
- Data required: none.
- Related APIs: `SEO-001`, `DISPLAY-005`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** Accepts XML response type.
**Request body:** None.
**Success response:** `200 OK` with XML sitemap.
**Error responses:** none explicit.
**Business rules:** Builds product URLs with category/subcategory/searchKey values.
**Source references:** `SitemapController.java`, `DisplayProductHelper.java`

### API ID: SEO-003 — Pages sitemap
- Domain: SEO
- Method: GET
- Endpoint: `/pages-sitemap.xml`
- Purpose: Return static pages and collection URLs for crawlers.
- Authentication: Not required.
- Authorization: none.
- Controller: `SitemapController.pagesSitemap`
- Service: none.
**Frontend usage**
- Search-engine indexing.
- User action: crawler access.
- Data required: none.
- Related APIs: `SEO-001`, `HOME-003`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** Accepts XML response type.
**Request body:** None.
**Success response:** `200 OK` with XML sitemap.
**Error responses:** none explicit.
**Business rules:** Adds storefront page URLs such as `/shop/cart`, `/shop/wishlist`, and category URLs.
**Source references:** `SitemapController.java`, `HomeServiceHelper.java`

### API ID: DEBUG-001 — HTML generation debug
- Domain: Test
- Method: GET
- Endpoint: `/api/v1/test/htmlgen`
- Purpose: Generate HTML for email and test PDF/email templates.
- Authentication: Conditional/public via config.
- Authorization: none explicit.
- Controller: `TestApi.htmlGenratorTest`
- Service: `EmailService` and `SaleServiceHelper`
**Frontend usage**
- Internal test endpoint only; not a storefront feature.
- User action: smoke-test template rendering.
- Data required: none in request.
- Related APIs: `ORDER-002`, `ORDER-003`, `ORDER-006`.
**Path parameters:** None
**Query parameters:** None
**Request headers:** None.
**Request body:** None.
**Success response:** `200 OK` with generated HTML string.
**Error responses:** none explicit.
**Business rules:** Produces email templates based on sale data and sends an email for demo/cancelled orders.
**Source references:** `TestApi.java`, `HTMLToPdfGenerater.java`, `EmailService.java`

## 3.4 Request and Response Models

The project does not use a conventional Spring REST DTO layer throughout the API. Most endpoints accept a generic JSON wrapper:

```json
{
  "payload": {
    "requestId": "string",
    "requestPayload": {
      "userRegPld": {},
      "flagPld": {},
      "cartArrayPld": [],
      "wishListArrayPld": [],
      "filtercriteria": [],
      "sortpayload": {},
      "paginationpayload": {},
      "reportNameTag": "string"
    },
    "tokenPayload": {
      "userName": "test@example.com",
      "role": "USER"
    }
  }
}
```

### Core custom payload model
- Class: `com.breaksloop.ECommerce.master.Payload`
- Fields:
  - `requestId` (`String`)
  - `requestPayload` (`String` serialized as JSON)
  - `responsePayload` (`String`)
  - `tokenPayload` (`String`)
  - `responseObj` (`Object`, internal/helper use only, ignored by JSON)
- Notes: `PayloadParseUtil` unwraps the outer JSON and converts these to/from `JSONObject` for service logic.

### Common request keys defined in `PayloadConstants`
- `PAYLOAD = "payload"`
- `REQ_ID = "requestId"`
- `REQ_PAYLOAD = "requestPayload"`
- `TOKEN_PAYLOAD = "tokenPayload"`
- `USER_REG_PLD = "userRegPld"`
- `FLAG_PLD = "flagPld"`
- `CART_ARR_PLD = "cartArrayPld"`
- `WISHLIST_ARR_PLD = "wishListArrayPld"`
- `FILTERCRITERIA_PLD = "filtercriteria"`
- `PAGINATION_PLD = "paginationpayload"`
- `SORT_PAYLOAD_PLD = "sortpayload"`
- `SALE_ITEMS_PLD = "saleItemsPld"`
- `PAYMENT_TOKEN_ID = "tokenId"`
- `SALE_COUPON_CODE = "couponCode"`

### Domain entities used as business models
1. `User`
- Fields include: `id`, `userName`, `name`, `lastName`, `email`, `password`, `role`, `dob`, `mobileNo`, `status`, `verifyToken`, etc.
- Used by: `AUTH-*`, `ORDER-*`, `PAYMENT-001`.
2. `Product`
- Includes category/subcategory association, `name`, `description`, `shortDesc`, `searchKey`, `units`, `status`, `isNew`, `selectedSku`.
- Used by: `PRODUCT-*`, `DISPLAY-*`, `HOME-*`.
3. `Sku`
- Includes `qty`, `units`, `status`, `SRAT`, `discount`, `availability`, `skuPictures`, `jSkuVariants`.
- Used by: `PRODUCT-*`, `DISPLAY-*`, `CART-*`.
4. `Jcart`
- Includes `id`, `sku`, `qty`, `units`, `userKey`, `product`, `createdTime`, `updatedTime`.
- Used by: `CART-*`, `ORDER-*`, `PAYMENT-001`.
5. `JWishList`
- Includes `id`, `product`, `sku`, `qty`, `units`, `userKey`.
- Used by: `WISHLIST-*`.
6. `Flag`
- Includes `id`, `name`, `flagTypeId`, `description`, `parentFlag`, `subCategories`, `flagPicture`.
- Used by: `FLAG-*`, `HOME-*`, `SEO-*`.
7. `Sale`, `SaleItem`, `SalePayment`, `AdditionalCharges`, `Address`
- Used by `ORDER-*` and `PAYMENT-001`.

### Response envelope pattern
Most services emit responses shaped like:

```json
{
  "responceObj": { ... },
  "status": "success"
}
```

Or, for validation failure:

```json
{
  "responceObj": { "errors": [ ... ] },
  "status": "failed"
}
```

## 3.5 Authentication and Authorization

- Login flow: `AUTH-002` returns a JWT assigned in `JwtTokenProvider.generateJwtToken(...)`.
- Token generation: JWT is signed with HMAC-512 using `app.jwt.secret` and includes issuer/audience claims and the `authorities` claim containing the user's role.
- Token lifetime: `EXPIRATION_PERIOD = 365` days (as configured in `CommonConstants`; comment says 5 days but value is 365).
- Token prefix: `Bearer `.
- Header usage: `JwtTokenVerifier` reads `Authorization` and strips the `Bearer ` prefix before validation.
- Public URLs: security config permits `/api/v1/**`, `/api/v2/**`, static resource patterns and sitemap pages.
- Protected routes: all routes not in `publicUrls` are `authenticated()`. The app does not appear to use explicit `@PreAuthorize` annotations for methods.
- Role model: `Role` enum values: `USER`, `ADMIN`, `SUPER_ADMIN`, `GUEST`.
- Authorisation checks observed:
  - `SaleService.saveDelivery` allows only `ADMIN` or `SUPER_ADMIN`.
  - `UserService.search`, `updateUser`, and `deleteUser` enforce `validateSuperAdmin`.
  - Other routes resolve a user from `tokenPayload` but do not explicitly restrict based on a role.
- Auth error handling: `/jwt/JwtAccessDeniedHandler.java` and `/jwt/JwtAuthenticationEntryPoint.java` set HTTP 401/403 and JSON content type; they do not provide a custom response body.
- No login refresh-token endpoint was found.
- No logout endpoint was found.
- No endpoint was found that returns the token in a dedicated refresh flow.

## 3.6 Frontend Page-to-API Mapping

| Frontend Page | User Action | API ID(s) | Method and Endpoint | Required Data |
|---|---|---|---|---|
| Registration | create account | AUTH-001 | `POST /api/v1/user/register` | user form data |
| Login | sign in | AUTH-002 | `POST /api/v1/user/login` | email/password |
| Forgot password | submit email | AUTH-004 | `POST /api/v1/user/reset-password` | email |
| Profile settings | update profile | AUTH-006 | `POST /api/v1/user/updateProfile` | user + address |
| Home | browse highlights | HOME-001, HOME-002, HOME-003 | multiple | filter criteria |
| Product listing | search/filter products | DISPLAY-001, DISPLAY-002 | `POST /api/v1/displayproducts/*` | filters/pagination |
| Product details | open product page | DISPLAY-005 | `GET /api/v1/displayproducts/find/{id}` | product ID |
| Cart | add/search/remove items | CART-001, CART-002, CART-003, CART-004 | `POST /api/v2/cart/*` | skuId, qty, user token |
| Wishlist | manage favorites | WISHLIST-001, WISHLIST-004 | `POST /api/v2/wishlist/*` | product/sku |
| Checkout | create order | ORDER-004, PAYMENT-001 | `POST /api/v2/sale/newsale`, `POST /api/v2/payment/stripe/create-payment` | cart, address, payment |
| Order details | view order | ORDER-001 | `POST /api/v2/sale/find` | billNumber |
| Order history | filter orders | REPORT-001 | `POST /api/v2/salereport/saledetail/search` | filters |
| Admin category management | add/update/delete categories | FLAG-001, FLAG-002, FLAG-003, FLAG-005 | `POST/GET /api/v1/flag/*` | category metadata |
| Admin product management | create/update/delete product | PRODUCT-001, PRODUCT-002, PRODUCT-003 | `POST /api/v2/setupproduct/*` | product payload |
| Admin sales reporting | export reports | REPORT-002, REPORT-003 | `POST /api/v2/salereport/download/*` | search criteria |

Notes: This mapping is recommendation-only and intentionally limited to APIs that are actually present in the codebase. Some routes are clearly internal/maintenance (e.g. `META-*`, `DEBUG-001`, `ORDER-007`), not user-facing storefront APIs.

## 3.7 End-to-End Workflows

### Customer registration and login
- `AUTH-001` creates or reuses the user record.
- `AUTH-002` validates credentials and returns the JWT.
- `AUTH-003` verifies a user email token when applicable.
- `AUTH-004` and `AUTH-005` support the reset-password flow.

### Product browsing and search
- `HOME-003` and `HOME-004` provide category/menu metadata.
- `HOME-001` and `HOME-002` support category/product home-page search.
- `DISPLAY-001` and `DISPLAY-002` provide the main listing/search flow.
- `DISPLAY-005` resolves a single product detail.

### Adding and updating cart items
- `CART-001` adds a single item.
- `CART-002` adds multiple items in a batch.
- `CART-004` loads current cart state.
- `CART-003` removes a cart item.

### Checkout and order creation
- `CART-004` loads cart state.
- `META-002` loads shipping/additional charges.
- `PAYMENT-001` creates the Stripe charge.
- `ORDER-004` creates the sale/order record after payment succeeds.
- `ORDER-001` fetches the order by bill number.

### Payment processing
- Payment is processed by `PAYMENT-001` with a Stripe token source.
- `ORDER-004` creates the sale once the payment succeeds.
- This implementation is not a pure "two-step purchase API" as a conventional e-commerce system would usually define; the payment and sale creation flow is a combined logic path.

### Order history and details
- `REPORT-001` searches sale details for admin reporting.
- `ORDER-001` fetches a specific order by bill number.
- `ORDER-006` generates a PDF invoice/order copy.

### Product and inventory administration
- `FILE-001` and `FILE-002` handle image import/upload tasks.
- `PRODUCT-001` saves or updates product definitions and variants.
- `PRODUCT-002` deletes a SKU.
- `PRODUCT-003` deletes a full product.
- `FLAG-*` manages category/subcategory taxonomy.

## 3.8 Pagination, Filtering, and Search

The API uses custom filter/search metadata rather than a single Spring `Pageable` DTO. Search endpoints read:
- `filtercriteria` (`PayloadConstants.FILTERCRITERIA_PLD`)
- `paginationpayload` (`PayloadConstants.PAGINATION_PLD`)
- `sortpayload` (`PayloadConstants.SORT_PAYLOAD_PLD`)

Observed search patterns:
- `filterCriteriaHelper.parseFilterCriteBOsByPayload(...)`
- `paginationHelper.parsePaginationBOByPayload(...)`
- `paginationHelper.parseSortBOByPayload(...)`
- `MasterUtil.getSortBySortBO(...)` uses `Sort.by(direction, orderBycolumn)`

Representative request shape:

```json
{
  "payload": {
    "requestPayload": {
      "filtercriteria": [
        { "filterBy": "categoryId", "filtervalue": "12", "filtercond": "=" }
      ],
      "paginationpayload": {
        "pageNumber": 1,
        "pageSize": 20
      },
      "sortpayload": {
        "orderBycolumn": "updatedTime",
        "orderByAscOrDesc": "desc"
      }
    }
  }
}
```

Observed response behavior:
- Search results are wrapped in `responceObj`.
- Some services populate `paginationBO.totalSize` for dataset totals.
- Search results vary by endpoint: products, categories, carts, wishlist entries, users, and sale details.

## 3.9 Error Handling and Validation

- There is no central `@ControllerAdvice` or global exception handler in the source.
- Validation is performed by service and helper classes and wrapped in a result object built via `masterUtil.constructResponsePayloadForErrors(errorList)`.
- Common response pattern:
  - `status = "failed"`
  - `responceObj` contains the error list structure
- Observed validation sources:
  - `UserRegistrationHelper.getUserRegistrationErrorList(...)`
  - `ProductServiceHelper.checkProductErrors(...)`
  - `CartServiceHelper.checkCartErrors(...)`
  - `SaleServiceHelper.checkErrors(...)`
- HTTP status behavior:
  - Most endpoints return HTTP `200 OK` regardless of success or failure because the business status is encoded in JSON.
  - Security layer may return HTTP 401/403 when JWT access is denied, via `JwtAccessDeniedHandler` and `JwtAuthenticationEntryPoint`.
- No explicit idempotency or retry policy was found in the code.
- No custom `Conflict`/`NotFound` specific error mapping was found.

## 3.10 API Coverage and Gaps

### Counts
- Total endpoints discovered: 62
- HTTP method counts (approximate): 47 POST, 14 GET, 1 XML GET route associated with sitemap endpoints (counted as part of the `GET` total)
- Highest-coverage domains: authentication, catalog, cart, orders, reporting, admin taxonomy.
- Coverage gaps / unclear areas:
  - No explicit OpenAPI/Swagger contract.
  - No standard typed DTOs for most endpoints; payload shapes are custom and interpreted dynamically.
  - Several endpoints are effectively public by route configuration and may rely on app logic rather than Spring Security role restrictions.
  - Some metadata and maintenance endpoints (`META-*`, `DEBUG-001`, `ORDER-007`) are not customer-facing but still exist in the backend.
  - No clear global standardized error body beyond `status` + `responceObj` exists.
  - `PAYMENT-001` contains a hard-coded Stripe secret in code and is therefore operationally sensitive.

### Verified gaps
- No refresh token endpoint.
- No logout endpoint.
- No conventional Swagger or OpenAPI documentation.
- No centralized domain error handling.
- No explicit versioned response schema registry.

### Unverified / requires verification
- The exact schema of every nested object in each dynamic payload is not fully codified in a single DTO; it is inferred from helper parsing logic.
- Some request headers, content types, and response codes are implied rather than explicitly declared in the controllers.
- The exact downstream data model for every `responceObj` field cannot be reconstructed without traversing the full helper/object graph.

## Summary

This repository exposes a substantial custom JSON-over-HTTP API, primarily driven by `Payload` wrappers and service-helper parsing rather than typed Spring DTOs. The system clearly supports customer auth, catalog browsing, cart/wishlist, checkout, order creation, admin product/category management, payment processing, and reporting. However, the API surface is custom and not standardized, and the project does not include Swagger/OpenAPI documentation or a globally consistent exception contract.
