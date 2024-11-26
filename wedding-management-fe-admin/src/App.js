import { useRoutes } from "react-router-dom";
import Themeroutes from "./routes/Router";
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  const routing = useRoutes(Themeroutes);

  return <div className="dark">{routing}</div>;
};

export default App;
