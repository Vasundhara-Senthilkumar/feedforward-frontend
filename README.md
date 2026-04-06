#  FeedForward — Food Waste Management System

FeedForward is a full-stack web application designed to reduce food waste by connecting food providers (restaurants, canteens, event organizers) with NGOs. It ensures surplus food reaches people in need instead of being wasted.

---

## 🚀 Features

* 🔐 Secure user authentication (Register/Login)
* 👤 Role-based access (Provider / NGO / Admin)
* 🍽️ Providers can add and manage food listings
* 📍 NGOs can browse and accept available food
* 📊 Admin dashboard for monitoring system data
* ⚡ Real-time updates and smooth UI experience

---

## 🛠️ Tech Stack

Frontend:

* React.js
* Tailwind CSS
* Axios
* React Router

Backend:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

---

## 📂 Project Structure

feedforward/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── config/

---

## ⚙️ Installation & Setup

1. Clone the repository

git clone https://github.com/your-username/feedforward.git
cd feedforward

---

2. Backend Setup

cd backend
npm install

Create a .env file and add:

PORT=5000
MONGO_URI=mongodb://localhost:27017/foodwaste
JWT_SECRET=your_secret_key

Run backend:

npm run dev

---

3. Frontend Setup

cd frontend
npm install
npm run dev

---

## 🌐 API Endpoints

Auth Routes:

* POST /api/auth/register
* POST /api/auth/login
* GET /api/auth/me

Food Routes:

* GET /api/food
* POST /api/food
* PUT /api/food/:id/accept
* PUT /api/food/:id/complete
* DELETE /api/food/:id

---

## 🎯 Future Enhancements

* 📱 Mobile responsive design
* 🗺️ Map integration for location tracking
* 📦 Image upload for food listings
* 🔔 Notification system

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Author

Vasundhara
B.Tech IT Student
Passionate about Web Development and Problem Solving
