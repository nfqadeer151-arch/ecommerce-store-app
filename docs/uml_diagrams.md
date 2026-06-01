# SmartCart UML Design Diagrams

This document contains high-quality UML diagrams detailing the structural design, data schema, and interaction flows of the SmartCart application. To ensure maximum readability and follow specifications, all flowchart and architecture diagram connections render with **straight (non-curved) arrows**.

---

## 1. System Architecture (Component Diagram)

This component diagram shows the boundaries and dependencies between the Next.js client, Express.js API backend, the Recommendations microservice, and the storage layers.

```mermaid
%%{init: { "flowchart": { "curve": "linear" } } }%%
flowchart TD
    subgraph Client ["Client Side (Next.js Application)"]
        UI["React UI Components<br>(Pages: Home, Feedback, Account)"]
        State["Zustand Cart Store<br>(cartStore.ts)"]
        Auth["Session/Auth Hooks<br>(auth.ts / useSession)"]
    end

    subgraph Gateway ["Services & API Routing"]
        ExpressApp["Express.js Server (Port 5000)<br>(backend/src/index.ts)"]
        AuthRoute["Auth Router<br>(/api/auth, /api/me)"]
        ProductRoute["Product Router<br>(/api/products)"]
        OrderRoute["Order Router<br>(/api/orders)"]
        FeedbackRoute["Feedback Router<br>(/api/feedback)"]
    end

    subgraph Microservices ["Microservices"]
        RecService["Recommendation Microservice (Port 5001)<br>(services/recommendations/src/index.ts)"]
    end

    subgraph Data ["Data & Storage Layer"]
        DB["In-Memory Database<br>(models.ts: db)"]
        LocalStorage["Web LocalStorage<br>(Session Tokens)"]
    end

    %% Client Internal Links
    UI --> State
    UI --> Auth
    Auth -.-> LocalStorage

    %% Client to Services
    UI --> ExpressApp
    UI --> RecService

    %% Express Route Mounting
    ExpressApp --> AuthRoute
    ExpressApp --> ProductRoute
    ExpressApp --> OrderRoute
    ExpressApp --> FeedbackRoute

    %% Route to Data Access
    AuthRoute --> DB
    ProductRoute --> DB
    OrderRoute --> DB
    FeedbackRoute --> DB
```

---

## 2. Domain Data Model (Class Diagram)

This class diagram represents the structural interfaces and associations between the core entities (`User`, `Product`, `Review`, `Order`, `CartItem`) and the Zustand store client managers.

```mermaid
classDiagram
    direction LR

    class User {
        +String id
        +String email
        +String passwordHash
        +String role
    }

    class Product {
        +String id
        +String name
        +String description
        +double price
        +String imageUrl
        +String category
        +Review[] reviews
    }

    class Review {
        +String userId
        +int rating
        +String comment
        +String date
    }

    class CartItem {
        +Product product
        +int quantity
    }

    class Order {
        +String id
        +String userId
        +CartItem[] items
        +double total
        +String createdAt
        +String status
    }

    class CartStore {
        +CartItem[] items
        +double total
        +addItem(product, quantity)
        +removeItem(productId)
        +updateQuantity(productId, quantity)
        +clearCart()
    }

    %% Relationships
    User "1" --> "*" Order : places
    Order "1" *-- "*" CartItem : contains
    CartItem "*" o-- "1" Product : references
    Product "1" *-- "*" Review : has
    User "1" --> "*" Review : writes
    CartStore "1" *-- "*" CartItem : manages
```

---

## 3. Order Checkout Workflow (Sequence Diagram)

Illustrates the step-by-step API message exchange between client components, backend middleware, and DB during checkout.

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer
    participant FE as Next.js Client
    participant Store as Zustand Cart Store
    participant Middleware as JWT Middleware
    participant Route as Orders Router
    participant DB as Database Store

    User->>FE: Click "Place Order"
    FE->>Store: Get active cart items & total
    Store-->>FE: Return items list + total price
    
    Note over FE,Route: Check Authorization Token
    FE->>Middleware: POST /api/orders (Headers: Bearer JWT)
    alt Token is missing or invalid
        Middleware-->>FE: Return 401 Unauthorized
        FE-->>User: Display login prompt / redirect
    else Token is valid
        Middleware->>Route: Pass User payload & Request body
        Route->>DB: Add new Order object (status: completed)
        DB-->>Route: Confirm write success
        Route-->>FE: Return 201 Created (Order detail payload)
        FE->>Store: clearCart()
        Store-->>FE: Cart reset to empty
        FE-->>User: Display success banner & reset cart UI
    end
```

---

## 4. Product Feedback Submission Workflow (Sequence Diagram)

Illustrates the message exchange during rating and feedback review submissions.

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer
    participant FE as Next.js Client
    participant Middleware as JWT Middleware
    participant Route as Feedback Router
    participant DB as Database Store

    User->>FE: Select product, choose stars, write comment, submit
    FE->>Middleware: POST /api/feedback (productId, rating, comment)
    
    alt Token is invalid / absent
        Middleware-->>FE: Return 401 Unauthorized
        FE-->>User: Prompt user to Sign In
    else Token is verified
        Middleware->>Route: Forward Review request payload
        Route->>DB: Find product, append Review to reviews array
        DB-->>Route: Product updated successfully
        Route-->>FE: Return 201 Created {"message": "Review saved!"}
        FE-->>User: Display success Toast ("Review saved!")
    end
```

---

## 5. Product Recommendation Retrieval Workflow (Sequence Diagram)

Illustrates how recommendation retrieval queries the separate Microservice when a customer views a product page.

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer
    participant FE as Next.js Client
    participant Rec as Recommendation Microservice
    participant DB as Recommendation Catalog

    User->>FE: View Product Detail Page (prod-1)
    FE->>Rec: GET /api/recommendations?productId=prod-1
    activate Rec
    Rec->>DB: Search catalog by productId and category
    DB-->>Rec: Matching and popular items
    Rec->>Rec: Compute Category-Content Matching fallback
    Rec-->>FE: Return recommendation list JSON
    deactivate Rec
    FE-->>User: Render related products section on UI
```
