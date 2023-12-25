import { memo, useState } from "react";
// import D3Treeview from "./d3-treeview/D3Treeview";
// import Card from "./component/card/Card";
import ConnectedScatterplot from "./component/connectedScatterplot/ConnectedScatterplot";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <ConnectedScatterplot />
        {/* <D3Treeview nodeElement={<customNodeElement />} /> */}
      </div>
    </>
  );
}

export default App;

const customNodeElement = memo(() => {
  return <div>Hello</div>;
});
