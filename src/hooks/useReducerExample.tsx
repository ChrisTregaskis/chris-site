import { useReducer } from "react";

// Define the initial state type
interface State {
  count: number;
}

// Define the action types
type Action = { type: "increment" | "decrement" }

// Define the initial state
const initialState: State = { count: 0 };

// Define the reducer function
function reducerExample(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      throw new Error('Unhandled action type');
  }
}

function Counter() {
  // Use the useReducer hook
  const [state, dispatch] = useReducer(reducerExample, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>Increment</button>
      <button onClick={() => dispatch({ type: "decrement" })}>Decrement</button>
    </div>
  );
}

export default Counter;