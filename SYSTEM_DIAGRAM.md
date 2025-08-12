# AI Architecture Diagram Generator - Prompt

## 🤖 **Prompt for AI Architecture Diagram Generator:**

```
I need you to create a High-Level Technical Architecture Diagram for Digital School Mobile project - a digital school management system. This diagram will be used in an academic report for reviewers to understand the system's operational flow.

**Architecture Requirements:**
Create a diagram with main blocks and how they connect to each other:

**1. CLIENT BLOCK (Mobile Applications):**
- Main App (React Native + Expo) - for managers/teachers/students
- Parent App (React Native + Expo) - for parents
- AsyncStorage (local data persistence)
- State Management (Zustand for caching)

**2. BACKEND BLOCK (Server):**
- Node.js + Express.js server
- API Gateway/Router
- Middleware (JWT auth, validation)
- Business Logic Services (various school management services)

**3. DATABASE BLOCK:**
- MongoDB (primary database)
- Zustand (client-side state management and caching)
- Cloudinary (file and image storage)

**4. EXTERNAL SERVICES BLOCK:**
- Firebase (push notifications)
- Email service (for account creation, password reset, etc.)
- WebSocket server (Socket.IO for real-time chat)

**5. INFRASTRUCTURE BLOCK:**
- Google Cloud Platform (GCP)
- Docker containers
- GitHub Actions (CI/CD pipeline)

**CONNECTIONS & COMMUNICATION:**

**HTTP Communication:**
- Client → Backend: HTTP requests (GET, POST, PUT, DELETE)
- Backend → Client: HTTP responses (JSON data)
- Backend → Database: Database queries
- Backend → External Services: API calls

**Real-time Communication:**
- Client ↔ Backend: WebSocket (Socket.IO) for real-time chat
- Backend → Client: Push notifications via Firebase

**Data Flow:**
1. **Authentication Flow**: Client → HTTP POST → Backend → Database → JWT Token → Client
2. **Data Fetching**: Client → HTTP GET → Backend → Database → JSON Response → Client
3. **Real-time Chat**: Client ↔ WebSocket ↔ Backend → Database → Real-time updates
4. **Push Notifications**: Backend → Firebase → Client devices
5. **File Upload**: Client → HTTP POST → Backend → Cloudinary → Database → Response
6. **Email Notifications**: Backend → Email Service → User (account creation, password reset)

**Protocols & Standards:**
- HTTP/HTTPS for RESTful APIs
- WebSocket for real-time features
- JWT for authentication
- JSON for data exchange

**Security:**
- JWT authentication middleware
- Input validation
- CORS handling

**Diagram Requirements:**
- Use Mermaid syntax
- Main blocks clearly separated
- Arrows showing HTTP requests/responses
- WebSocket connections displayed
- Database connections clear
- Color coding for different blocks
- Labels for protocols (HTTP, WebSocket, JWT)
- Show data flow direction
- Keep it HIGH-LEVEL for academic presentation

**Diagram Structure:**
```
[CLIENT BLOCK] ←→ HTTP/WebSocket ←→ [BACKEND BLOCK] ←→ [DATABASE BLOCK]
                                    ↓
                              [EXTERNAL SERVICES]
                                    ↓
                              [INFRASTRUCTURE]
```

Please create a professional High-Level Technical Architecture Diagram that clearly shows how the blocks connect and communicate with each other through different protocols. This diagram should be suitable for academic presentation and clearly demonstrate the system's operational flow without overwhelming technical details.
```

## 🎯 **Expected Result:**

- **CLIENT BLOCK** at the top
- **BACKEND BLOCK** in the middle (core)
- **DATABASE BLOCK** at the bottom
- **EXTERNAL SERVICES** on the side
- **INFRASTRUCTURE** at the very bottom
- **HTTP arrows** for REST APIs
- **WebSocket arrows** for real-time
- **Database connections** clearly shown
- **Protocol labels** on each connection

## 📋 **How to Use:**

1. **Copy the entire prompt** above
2. **Paste into AI Architecture Diagram Generator**
3. **Specify output format**: Mermaid diagram
4. **Request**: High-level technical architecture diagram for academic presentation

## 🏗️ **What This Will Generate:**

This prompt will create a **high-level technical architecture diagram** that shows:
- Clear separation of concerns
- How different layers communicate
- Data flow between components
- Protocol specifications
- Technology stack integration
- Security considerations

**Perfect for academic reports and presentations to reviewers!**
