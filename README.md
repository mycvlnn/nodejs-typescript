## 📁 Cấu trúc thư mục

```
my-app/
│
├── src/
│ ├── config/ # Cấu hình môi trường, database, logger, v.v.
│ ├── controllers/ # Xử lý request từ client, gọi services
│ ├── services/ # Chứa logic nghiệp vụ -> Gọi Models để thao tác DB
│ ├── routes/ # Định nghĩa các route, liên kết controller
│ ├── models/ # Định nghĩa schema (Mongoose hoặc ORM models), thao tác DB
│ ├── middlewares/ # Middleware như auth, error handling,...
│ ├── utils/ # Hàm helper, function tái sử dụng
│ ├── validations/ # Validate input (Joi, Zod,...)
│ ├── interfaces/ # Type/interface dùng chung toàn dự án
│ ├── constants/ # Biến cố định như role, status code, messages,...
│ ├── jobs/ # Các cronjob hoặc queue job
│ ├── app.ts # Khởi tạo express app
│ └── server.ts # Start server
│
├── .env # Environment variables
├── .env.development # Template environment
├── tsconfig.json # Cấu hình TypeScript
├── package.json # Quản lý dependencies
├── nodemon.json # Config cho nodemon (auto reload khi dev)
└── README.md # Mô tả dự án
```
