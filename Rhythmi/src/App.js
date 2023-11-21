import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import Frame from "./pages/Frame";
import Librarypage from "./pages/Librarypage";
import Howpage from "./pages/Howpage";
import About from "./pages/About";
import Generation from "./pages/Generation";
import Createpage from "./pages/Createpage"
import Song from "./pages/Song";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "";
        metaDescription = "";
        break;
      case "/librarypage":
        title = "";
        metaDescription = "";
        break;
      case "/howpage":
        title = "";
        metaDescription = "";
        break;
      case "/aboutpage":
        title = "";
        metaDescription = "";
        break;
      case "/generation":
        title = "";
        metaDescription = "";
        break;
      case "/createpage":
        title = "";
        metaDescription = "";
        break;
      case "/song":
        title = "";
        metaDescription = "";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Frame />} />
      <Route path="/librarypage" element={<Librarypage />} />
      <Route path="/howpage" element={<Howpage />} />
      <Route path="/aboutpage" element={<About />} />
      <Route path="/generation" element={<Generation />} />
      <Route path="/createpage" element={<Createpage />} />
      <Route path="/song" element={<Song />} />
    </Routes>
  );
}
export default App;
