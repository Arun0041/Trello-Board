import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BoardsHome from './pages/BoardsHome';
import BoardView from './pages/BoardView';
import { BoardProvider } from './context/BoardContext';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BoardsHome />} />
        <Route
          path="/b/:boardId"
          element={
            <BoardProvider>
              <BoardView />
            </BoardProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}