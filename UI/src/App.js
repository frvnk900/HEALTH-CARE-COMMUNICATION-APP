import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./context/ProtectedRoute";
import { PublicRoute } from "./context/ProtectedRoute";
import Notification from "./components/notification_alert";
import "./App.css";
import GetStarted from "./Pages/get_started_screen";
import Login from "./Pages/login_screen";
import Signup from "./Pages/register_screen";
import Home from "./Pages/home_screen";
import Schedule from "./Pages/schedule_screen";
import EditProfile from "./Pages/edit_profile_screen";
import MyMap from "./Pages/map_screen";
import Team from "./Pages/contact_us";
import Help from "./Pages/Help_screen";
import Dashboard from "./Pages/dashboard";
import Settings from "./Pages/settings";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GetStarted />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <MyMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-contact"
        element={
          <ProtectedRoute>
            <Team />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Notification />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
