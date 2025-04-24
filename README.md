# nodejs-typescript

my-app/
│
├── src/
│ ├── config/ # Cấu hình môi trường, database, logger, v.v.
│ ├── controllers/ # Xử lý request từ client, gọi services
│ ├── services/ # Chứa logic nghiệp vụ
│ ├── routes/ # Định nghĩa các route, liên kết controller
│ ├── models/ # Định nghĩa schema (nếu dùng Mongoose) hoặc ORM models
│ ├── middlewares/ # Các middleware như auth, error handling,...
│ ├── utils/ # Hàm helper, function tái sử dụng
│ ├── validations/ # Validate input (sử dụng Joi, Zod,...)
│ ├── interfaces/ # Type/interface chung cho toàn dự án
│ ├── constants/ # Biến cố định như role, status code, messages,...
│ ├── jobs/ # Các cronjob hoặc queue job
│ ├── app.ts # File khởi tạo express app
│ └── server.ts # File start server
│
├── .env # Environment variables
├── .env.example # Template env
├── tsconfig.json # Cấu hình TypeScript
├── package.json # Quản lý dependencies
├── nodemon.json # Config cho nodemon (auto reload khi dev)
└── README.md # Mô tả dự án
