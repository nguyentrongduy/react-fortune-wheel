/* eslint-disable no-unused-vars */
import React, { useState } from "react";

import "./App.css";
import FortuneWheel from "./components/FortuneWheel";

function App() {
  const [prizeId, setPrizeId] = useState(null);
  const [canvasVerify, setCanvasVerify] = useState(false);
  const [canvasOptions, setCanvasOptions] = useState({
    btnWidth: 140,
    borderColor: "#584b43",
    borderWidth: 6,
    lineHeight: 30,
  });
  const [prizesCanvas, setPrizesCanvas] = useState([
    {
      id: 1,
      name: "Blue", // Prize name
      value: "Blue's value", // Prize value
      bgColor: "#45ace9", // Background color
      color: "#ffffff", // Font color
      probability: 10, // Probability, up to 4 decimal places
    },
    {
      id: 2,
      name: "Red",
      value: "Red's value",
      bgColor: "#dd3832",
      color: "#ffffff",
      probability: 10,
    },
    {
      id: 3,
      name: "Yellow",
      value: "Yellow's value",
      bgColor: "#fef151",
      color: "#ffffff",
      probability: 10,
    },
    {
      id: 4,
      name: "brown",
      value: "brown's value",
      bgColor: "brown",
      color: "#ffffff",
      probability: 70,
    },
  ]);
  const [prizesImage, setPrizesImage] = useState([
    {
      id: 1,
      value: "Blue's value", // Prize value
      weight: 0, // Weights
    },
    {
      id: 2,
      value: "Red's value",
      weight: 1,
    },
    {
      id: 3,
      value: "Yellow's value",
      weight: 0,
    },
  ]);

  const onImageRotateStart = () => {
    console.log("onImageRotateStart");
  };

  const onRotateEnd = (prize) => {
    alert(prize.value);
  };

  const onChangePrize = (id) => {
    setPrizeId(id);
  };

  const onCanvasRotateStart = (rotate) => {
    if (canvasVerify) {
      const verified = true; // true: the test passed the verification, false: the test failed the verification
      doServiceVerify(verified, 2000).then((verifiedRes) => {
        if (verifiedRes) {
          console.log("Verification passed, start to rotate");
          rotate(); // Call the callback, start spinning
          setCanvasVerify(false);
        } else {
          alert("Failed verification");
        }
      });
      return;
    }
    console.log("onCanvasRotateStart");
  };

  const doServiceVerify = async (verified, duration) => {
    // Parameter 1: Whether to pass the verification, 2: Delay time
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(verified);
      }, duration);
    });
  };

  return (
    <div className="App">
      <FortuneWheel
        style={{
          width: 500,
          maxWidth: "100%",
        }}
        verify={canvasVerify}
        canvas={canvasOptions}
        prizes={prizesCanvas}
        rotateStart={onCanvasRotateStart}
        rotateEnd={onRotateEnd}
      />

      <FortuneWheel
        style={{
          width: 500,
          maxWidth: "100%",
        }}
        type="image"
        useWeight={true}
        prizeId={prizeId}
        angleBase={10}
        prizes={prizesImage}
        rotateStart={onImageRotateStart}
        rotateEnd={onRotateEnd}
        duration={6000}
      />
      <div className="btn-list">
        {prizesCanvas.map((prize, idx) => (
          <div
            className="btn"
            key={idx}
            style={{ background: prize.bgColor }}
            onClick={() => onChangePrize(prize.id)}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default App;
