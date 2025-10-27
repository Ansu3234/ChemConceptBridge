# ChemConcept Bridge

An AI-powered chemistry learning platform that bridges the gap between abstract chemistry concepts and student understanding. The platform uses adaptive quizzes, misconception detection, visual simulations, and personalized remediation to make learning interactive, engaging, and exam-ready.

## 🚀 Features Implemented (50% Complete)

### ✅ Core Features
- **Professional Dashboard System** - Role-based navigation for Students, Teachers, and Admins
- **Static Concept Pages** - Comprehensive chemistry topics with interactive content
  - Acids & Bases (Fully implemented with detailed explanations, pH scale, reactions)
  - Periodic Table (Placeholder with coming soon interface)
  - Chemical Bonding (Placeholder with coming soon interface)
  - Thermodynamics (Placeholder with coming soon interface)
- **Adaptive Quiz Engine** - MCQ-based quizzes with misconception detection
- **Professional UI/UX** - Modern, responsive design with consistent design system
- **Backend API** - RESTful APIs for quizzes, concepts, and user management

### 🔄 In Progress
- **Backend Enhancement** - Quiz and concept management APIs
- **Authentication System** - JWT-based authentication with role-based access

### 📋 Pending Features
- **Concept Mapping Tool** - Drag-and-drop concept relationship visualization
- **Confidence Meter** - Self-assessment and performance comparison
- **Gamification Elements** - Badges, XP points, leaderboards
- **Micro-Remediation Module** - Corrective content and personalized help
- **Advanced Analytics** - Performance tracking and progress visualization

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **CSS3** - Custom styling with modern design patterns
- **Axios** - HTTP client for API communication
- **Formik + Yup** - Form handling and validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### Machine Learning
- **Python 3.8+** - Machine learning environment
- **scikit-learn** - ML algorithms and utilities
- **pandas** - Data manipulation and analysis
- **numpy** - Numerical computing
- **matplotlib** - Data visualization
- **joblib** - Model serialization
- **seaborn** - Statistical data visualization

## 📁 Project Structure

```
chemconcept-bridge/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/          # Dashboard components
│   │   │   ├── Concepts/           # Concept pages
│   │   │   ├── Quiz/               # Quiz engine
│   │   │   ├── ConceptMap/         # Concept mapping tool
│   │   │   ├── Progress/           # Progress tracking
│   │   │   ├── Remediation/        # Remediation module
│   │   │   └── Gamification/       # Gamification features
│   │   ├── pages/                  # Main pages
│   │   └── App.js                  # Main app component
│   └── package.json
├── backend/
│   ├── models/                     # Database models
│   ├── routes/                     # API routes
│   ├── middleware/                 # Custom middleware
│   ├── ml/                         # Machine Learning models
│   │   ├── data_generator.py       # Generate training data
│   │   ├── train_models.py         # Train all ML models
│   │   ├── visualize_results.py    # Visualize model performance
│   │   ├── predict_knn.py          # KNN prediction script
│   │   ├── knn_model.py            # KNN model training
│   │   └── requirements.txt        # Python dependencies
│   └── server.js                   # Server entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chemconcept-bridge
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Setup**
   Copy `.env.example` to `.env` in the backend directory and fill in values:
   ```bash
   cd backend
   Copy-Item .env.example .env  # Windows PowerShell (use: cp .env.example .env on Unix)
   ```
   Then edit `.env` and set your secrets (Mongo URI, JWT secret, Google OAuth, email, etc.).

5. **Start the development servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm start
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

6. **Machine Learning Setup (Optional)**
   
   Install Python dependencies:
   ```bash
   cd backend/ml
   pip install -r requirements.txt
   ```
   
   Generate training data and train models:
   ```bash
   python data_generator.py    # Generate synthetic student data
   python train_models.py      # Train all ML models
   python visualize_results.py # Generate comparison charts
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎯 User Roles

### Student
- Access to concept pages and learning materials
- Take adaptive quizzes with instant feedback
- View progress and performance analytics
- Access remediation content for difficult concepts
- Participate in gamification features

### Teacher
- Create and manage quizzes
- Monitor student progress and performance
- Access analytics and reports
- Manage content and concepts
- View student misconceptions and areas of difficulty

### Admin
- Full system access and user management
- Content management and moderation
- System analytics and reporting
- User role management
- System configuration

## 🧪 Chemistry Topics Covered

### Acids & Bases (Fully Implemented)
- Arrhenius and Brønsted-Lowry definitions
- pH scale and calculations
- Acid-base reactions and neutralization
- Buffer solutions and their importance
- Real-world applications and examples

### Periodic Table (Placeholder)
- Element properties and trends
- Periodic law and organization
- Group and period characteristics

### Chemical Bonding (Placeholder)
- Ionic, covalent, and metallic bonds
- Molecular geometry and shapes
- Bond strength and energy

### Thermodynamics (Placeholder)
- Energy changes and enthalpy
- Entropy and free energy
- Spontaneous processes

## 🤖 Machine Learning Models

The platform includes comprehensive ML models for predicting student performance. Five different algorithms are implemented and compared:

### Implemented Models

1. **K-Nearest Neighbors (KNN)**
   - Instance-based learning algorithm
   - Classifies based on similarity to k nearest neighbors
   - Simple and intuitive approach

2. **Naive Bayes Classifier**
   - Probabilistic classifier based on Bayes' theorem
   - Assumes feature independence
   - Fast training and prediction

3. **Decision Tree**
   - Tree-based learning algorithm
   - Makes decisions through hierarchical rules
   - Highly interpretable

4. **Support Vector Machine (SVM)**
   - Margin-maximization algorithm
   - Uses RBF kernel for non-linear classification
   - Robust to overfitting

5. **Backpropagation Neural Network**
   - Multi-layer perceptron with backpropagation
   - Hidden layers: [100, 50] neurons
   - Can capture complex non-linear patterns

### Model Evaluation Metrics

All models are evaluated using:
- **Accuracy**: Overall correctness
- **Precision**: True positive rate among predicted positives
- **Recall**: True positive rate among actual positives
- **F1-Score**: Harmonic mean of precision and recall

### Training Process

1. **Data Generation**: Creates synthetic student performance data (500 samples)
2. **Model Training**: Trains all 5 models on the dataset
3. **Evaluation**: Compares models using multiple metrics
4. **Visualization**: Generates comparison charts and radar plots

### Model Usage

The best-performing model can be used for:
- Predicting student performance categories (weak/average/strong)
- Early intervention recommendations
- Personalized learning paths
- Performance risk assessment

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Quizzes
- `GET /api/quiz` - Get all quizzes
- `GET /api/quiz/:id` - Get specific quiz
- `POST /api/quiz` - Create quiz (Teacher/Admin)
- `POST /api/quiz/:id/attempt` - Submit quiz attempt
- `GET /api/quiz/attempts/student` - Get student attempts
- `GET /api/quiz/:id/stats` - Get quiz statistics

### Concepts
- `GET /api/concept` - Get all concepts
- `GET /api/concept/:id` - Get specific concept
- `POST /api/concept` - Create concept (Teacher/Admin)
- `PUT /api/concept/:id` - Update concept (Teacher/Admin)
- `DELETE /api/concept/:id` - Delete concept (Admin)
- `GET /api/concept/search/:query` - Search concepts

## 🎨 Design System

### Color Palette
- **Primary**: #3b82f6 (Blue)
- **Secondary**: #8b5cf6 (Purple)
- **Success**: #16a34a (Green)
- **Warning**: #d97706 (Orange)
- **Danger**: #dc2626 (Red)
- **Neutral**: #64748b (Gray)

### Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings**: 24px-28px, font-weight 700
- **Body**: 14px-16px, font-weight 400-500
- **Captions**: 12px, font-weight 500

### Components
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: 8px border radius, hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Sidebar with role-based menu items

## 📊 Current Progress

- ✅ **Dashboard System** (100%)
- ✅ **Concept Pages** (25% - Acids & Bases complete)
- ✅ **Quiz Engine** (80% - Core functionality complete)
- ✅ **UI/UX Design** (90% - Professional design system)
- ✅ **Backend APIs** (70% - Core APIs implemented)
- 🔄 **Authentication** (60% - Basic auth implemented)
- ⏳ **Concept Mapping** (0% - Placeholder)
- ⏳ **Gamification** (0% - Placeholder)
- ⏳ **Remediation** (0% - Placeholder)
- ⏳ **Analytics** (0% - Placeholder)

## 🚀 Next Steps

1. **Complete Authentication System**
   - Implement protected routes
   - Add role-based access control
   - Enhance security features

2. **Implement Remaining Concept Pages**
   - Periodic Table interactive content
   - Chemical Bonding visualizations
   - Thermodynamics calculations

3. **Add Advanced Features**
   - Concept mapping tool
   - Gamification elements
   - Micro-remediation module
   - Performance analytics

4. **Testing and Optimization**
   - Unit tests for components
   - Integration tests for APIs
   - Performance optimization
   - Accessibility improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**ChemConcept Bridge** - Making Chemistry Learning Interactive and Engaging! 🧪✨
