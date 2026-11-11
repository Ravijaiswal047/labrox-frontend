
// import { useRef } from "react";

// export const useFocusManager = (order = []) => {
//   const refs = useRef({});

//   const setRef = (id) => (el) => {
//     if (el) refs.current[id] = el;
//   };

//   const handleFocusNext = (e, currentId) => {
//       if (e.key === "Tab" && !e.shiftKey) {
//           e.preventDefault();
//           const idx = order.indexOf(currentId);
//           const nextId = order[(idx + 1) % order.length];
//           refs.current[nextId]?.focus?.();
//           console.log('nextId', nextId);
//     }
//   };

//   const focusFirst = () => {
//     const firstId = order[0];
//     refs.current[firstId]?.focus?.();
//   };

//   return { setRef, handleFocusNext, focusFirst };
// };


import { useRef } from "react";

export const useFocusManager = (order = []) => {
  const refs = useRef({});

  const setRef = (id) => (el) => {
    if (el) refs.current[id] = el;
  };

  const handleFocusNext = (e, currentId) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const idx = order.indexOf(currentId);
      const nextId = order[(idx + 1) % order.length];
      refs.current[nextId]?.focus?.();
    }
  };

  const focusFirst = () => {
    // Disabled auto-focus on first element to prevent unwanted selection
    return;
  };

  return { setRef, handleFocusNext, focusFirst };
};
