# SmartCart UML Design Diagrams

This document contains high-quality UML diagrams detailing the structural design, data schema, and interaction flows of the SmartCart monorepo application. 

---

## 1. System Architecture (Component Diagram)

Shows the structural boundaries and dependencies between the Next.js frontend client, the Express.js API backend, and the Database data layer.

```mermaid
graph TD
    %% Define Nodes
    Client["💻 Next.js Web Client (Port 3000/3001)"]
    API["🚀 Express.js API Server (Port 5000)"]
    DB[("📦 In-Memory Data Store (db.ts)")]

    %% Client Components
    subgraph Frontend [Next.js App Workspace]
        Client
        CartStore["Zustand Cart Store"]
        AuthContext["Auth Context (Session Hook)"]
        Client -.-> CartStore
        Client -.-> AuthContext
    end

    %% Backend Router & Middlewares
    subgraph Backend [Express API Workspace]
        API
        AuthMiddleware["JWT Authentication Middleware"]
        AuthRouter["Auth Router (/api/auth)"]
        ProdRouter["Products Router (/api/products)"]
        FeedRouter["Feedback Router (/api/feedback)"]
        OrderRouter["Orders Router (/api/orders)"]

        API --> AuthMiddleware
        AuthMiddleware --> AuthRouter
        AuthMiddleware --> ProdRouter
        AuthMiddleware --> FeedRouter
        AuthMiddleware --> OrderRouter
    end

    %% Connections
    Client ===>|HTTPS JSON API Requests| API
    AuthRouter ===>|Read/Write User Profiles| DB
    ProdRouter ===>|Read Product Catalog| DB
    FeedRouter ===>|Write Reviews| DB
    OrderRouter ===>|Write Orders & Cart Items| DB
```

---

## 2. Domain Data Model (Class Diagram)

Shows the structural interfaces, data attributes, and relational associations between the core entities (`User`, `Product`, `Review`, `Order`, and `CartItem`).

```mermaid
classDiagram
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
        +Number price
        +String imageUrl
        +String category
        +Review[] reviews
    }

    class Review {
        +String userId
        +Number rating
        +String comment
        +String date
    }

    class CartItem {
        +Product product
        +Number quantity
    }

    class Order {
        +String id
        +String userId
        +CartItem[] items
        +Number total
        +String createdAt
        +String status
    }

    %% Associations & Aggregations
    Product "1" *-- "many" Review : contains
    Order "1" *-- "many" CartItem : contains
    CartItem "1" o-- "1" Product : references
    User "1" --> "many" Order : places
    User "1" --> "many" Review : authors
```

---

## 3. Order Checkout Workflow (Sequence Diagram)

Illustrates the step-by-step API message exchange between the client components, backend middleware, and DB during checkout.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Customer
    participant FE as 💻 Next.js Client
    participant Store as 🛒 Zustand Cart
    participant Middleware as 🔒 JWT Middleware
    participant Route as 📦 Orders Router
    participant DB as 💾 Database Store

    User->>FE: Click "Place Simulated Order"
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
    actor User as 👤 Customer
    participant FE as 💻 Next.js Client
    participant Middleware as 🔒 JWT Middleware
    participant Route as 💬 Feedback Router
    participant DB as 💾 Database Store

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
