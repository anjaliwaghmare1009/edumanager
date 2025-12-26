# Student & Course Management Backend

## Objective
This project is a backend system for managing students and their associated courses.
It demonstrates backend development, SQL database design, and role-based access control.

---

## Tech Stack
- Backend: Node.js / Express (or your actual stack)
- Database: MySQL / PostgreSQL
- ORM / Query Tool: (if used)
- API Testing: Postman

---

## Features
### Admin Role
- Add courses
- Register students with course assignment
- Update student details and change course
- Delete student records
- View all students with course details

### Student Role
- View own profile
- View enrolled course information

---

## Database Design
### Course Table
- course_id (Primary Key)
- course_name
- course_code (Unique)
- course_duration

### Student Table
- student_id (Primary Key)
- name
- email
- course_id (Foreign Key)

---

## API Endpoints (Sample)
| Method | Endpoint | Description | Role |
|------|---------|------------|------|
| POST | /api/courses | Create course | Admin |
| POST | /api/students | Add student | Admin |
| GET | /api/students | Get all students | Admin |
| GET | /api/courses/:id/students | Students by course | Admin |
| PUT | /api/students/:id | Update student | Admin |
| DELETE | /api/students/:id | Delete student | Admin |
| GET | /api/students/me | View own details | Student |

---

## Role-Based Access Control
- Admin can perform all CRUD operations
- Student access is restricted to read-only personal data

---

## How to Run Locally
1. Clone the repository
2. Install dependencies
   ```bash
   npm install
