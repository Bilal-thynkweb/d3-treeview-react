import { memo, useState } from "react";
import D3Treeview from "./d3-treeview/D3Treeview";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <D3Treeview nodeElement={<customNodeElement />} />
      </div>
    </>
  );
}

export default App;

const customNodeElement = memo(() => {
  return <div>Hello</div>;
});
