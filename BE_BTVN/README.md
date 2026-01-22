# BE_BTVN - Express.js TypeScript Authentication API

Dự án Express.js đơn giản sử dụng TypeScript với các chức năng Register, Login, và Forget Password.

## 🚀 Tính năng

- ✅ **Register** - Đăng ký tài khoản mới
- ✅ **Login** - Đăng nhập với email và password
- ✅ **Forget Password** - Tạo token reset password
- ✅ **Reset Password** - Đặt lại mật khẩu với token
- ✅ **Get Current User** - Lấy thông tin user hiện tại (protected route)

## 🛠️ Công nghệ sử dụng

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

## 📋 Yêu cầu

- Node.js >= 14.x
- MySQL >= 5.7
- npm hoặc yarn

## 🔧 Cài đặt

### 1. Clone hoặc tải project

```bash
cd BE_BTVN
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình database

Tạo database MySQL:

```sql
CREATE DATABASE be_btvn;
```

### 4. Cấu hình environment variables

Copy file `.env.example` thành `.env` và cập nhật thông tin:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=be_btvn
DB_USER=root
DB_PASSWORD=your-mysql-password

JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
```

### 5. Chạy project

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Endpoints

### Base URL: `http://localhost:5000/api/auth`

### 1. Register (Đăng ký)

**POST** `/api/auth/register`

**Body:**

```json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com"
  }
}
```

### 2. Login (Đăng nhập)

**POST** `/api/auth/login`

**Body:**

```json
{
  "email": "nguyenvana@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com"
  }
}
```

### 3. Forget Password (Quên mật khẩu)

**POST** `/api/auth/forget-password`

**Body:**

```json
{
  "email": "nguyenvana@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset token generated. In production, this would be sent via email.",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Lưu ý:** Trong production, token này sẽ được gửi qua email. Hiện tại trả về trực tiếp trong response để test.

### 4. Reset Password (Đặt lại mật khẩu)

**POST** `/api/auth/reset-password`

**Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 5. Get Current User (Lấy thông tin user) - Protected

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "createdAt": "2026-01-21T08:30:00.000Z"
  }
}
```

## 🧪 Test API

Bạn có thể test API bằng:

1. **Postman** - Import collection và test
2. **Thunder Client** (VS Code Extension)
3. **cURL**

### Ví dụ với cURL:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get current user (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Cấu trúc thư mục

```
BE_BTVN/
├── src/
│   ├── config/
│   │   └── database.ts          # MySQL connection
│   ├── controllers/
│   │   └── auth.controller.ts   # Authentication logic
│   ├── models/
│   │   ├── index.ts             # Models export
│   │   └── user.model.ts        # User model
│   ├── routes/
│   │   └── auth.routes.ts       # API routes
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   └── error.middleware.ts  # Error handling
│   ├── utils/
│   │   └── jwt.ts               # JWT utilities
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── server.ts                # Entry point
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Bảo mật

- Mật khẩu được hash bằng bcrypt (10 salt rounds)
- JWT token cho authentication
- Reset token có thời hạn 15 phút
- Input validation với express-validator
- Protected routes với JWT middleware

## 📝 Lưu ý

1. **JWT_SECRET**: Đổi `JWT_SECRET` trong file `.env` thành một chuỗi ngẫu nhiên phức tạp
2. **Database**: Đảm bảo MySQL đang chạy và thông tin kết nối đúng
3. **Email**: Chức năng Forget Password hiện tại trả về token trực tiếp. Trong production, cần tích hợp email service (Nodemailer, SendGrid, etc.)

## 🐛 Troubleshooting

### Lỗi kết nối database

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Giải pháp:**

- Kiểm tra MySQL đang chạy: `mysql -u root -p`
- Kiểm tra thông tin trong file `.env`

### Lỗi "ER_NOT_SUPPORTED_AUTH_MODE"

**Giải pháp:**

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your-password';
FLUSH PRIVILEGES;
```

## 📄 License

ISC

## 👨‍💻 Author

BE_BTVN Project
