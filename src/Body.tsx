import Navbar from "./components/navbar/Navbar";
import Field from "./components/field/Field";
import Sidebar from "./components/sidebar/Sidebar";
import AppMenu from "./AppMenu";
import PathAnimationPanel from "./components/field/PathAnimationPanel";

function Body() {
  return (
    <div className="App">
      <div className="Page">
        <AppMenu />
        <div className="workspace">
          <Sidebar />
          <main className="workspace-main">
            <Navbar />
            <Field />
            <PathAnimationPanel />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Body;
