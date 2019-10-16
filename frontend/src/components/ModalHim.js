import React from "react";

export const ModalHim = ({ message, close }) => {
  const array = ["asda", "asd", "asd"];
  return (
    <div>
      <p>{message}</p>
      <div>
        {array.map(value => (
          <p>{value}</p>
        ))}
      </div>
      <button onClick={close}>close</button>
    </div>
  );
};
