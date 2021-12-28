/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useRef, Fragment } from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import buttonAsset from "../../assets/button.png";
import wheelAsset from "../../assets/wheel.png";
import "./index.css";

const canvasDefaultConfig = {
  radius: 250, // Radius of the circle
  textRadius: 190, // The distance between the prize position and the center of the circle
  textLength: 6, // Prize text 1 line of several characters, up to 2 lines
  textDirection: "horizontal", // Prize text direction
  lineHeight: 20, // Text line height
  borderWidth: 0, // Round outer border
  borderColor: "transparent", // Outer border color
  btnText: "GO", // Start button text
  btnWidth: 140, // Button width
  fontSize: 34, // Prize size
};

function getStrArray(str, len) {
  const arr = [];
  while (str !== "") {
    let text = str.substr(0, len);
    if (str.charAt(len) !== "" && str.charAt(len) !== " ") {
      // If the next line exists and the first character of the next line is not a space
      const index = text.lastIndexOf(" ");
      if (index !== -1) text = text.substr(0, index);
    }
    str = str.replace(text, "").trim();
    arr.push(text);
  }
  return arr;
}

const FortuneWheel = ({
  rotateEnd,
  rotateStart,
  canvas,
  type,
  useWeight,
  disabled,
  duration,
  timingFun,
  angleBase,
  prizeId,
  prizes,
}) => {
  const canvasRef = useRef(null);

  const [rotateEndDeg, setRotateEndDeg] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [prizeRes, setPrizeRes] = useState({});

  // =========== watch ===========
  useEffect(() => {
    checkProbability();
  }, []);

  useEffect(() => {
    if (type === "canvas") {
      drawCanvas();
    }
  }, [type]);

  useEffect(() => {
    if (!isRotating) return;
    let newAngle = getTargetDeg(prizeId);
    if (angleBase < 0) newAngle -= 360;
    const prevEndDeg = rotateEndDeg;
    let nowEndDeg = angleBase * 360 + newAngle;
    const angle = 360 * Math.floor((nowEndDeg - prevEndDeg) / 360);
    if (angleBase >= 0) {
      nowEndDeg += Math.abs(angle);
    } else {
      nowEndDeg += -360 - angle;
    }
    setRotateEndDeg(nowEndDeg);
  }, [prizeId]);

  // =========== computed ===========
  const canvasConfig = useMemo(() => {
    return { ...canvasDefaultConfig, ...canvas };
  }, [canvas]);

  const probabilityTotal = useMemo(() => {
    if (useWeight) return 100;
    return _.sumBy(prizes, (row) => row.probability || 0);
  }, [prizes, useWeight]);

  const decimalSpaces = useMemo(() => {
    if (useWeight) return 0;
    const sortArr = [...prizes].sort((a, b) => {
      const aRes = String(a.probability).split(".")[1];
      const bRes = String(b.probability).split(".")[1];
      const aLen = aRes ? aRes.length : 0;
      const bLen = bRes ? bRes.length : 0;
      return bLen - aLen;
    });
    const maxRes = String(sortArr[0].probability).split(".")[1];
    const idx = maxRes ? maxRes.length : 0;
    return [1, 10, 100, 1000, 10000][idx > 4 ? 4 : idx];
  }, [prizes, useWeight]);

  const prizesIdArr = useMemo(() => {
    const idArr = [];
    prizes.forEach((row) => {
      const count = useWeight
        ? row.weight || 0
        : (row.probability || 0) * decimalSpaces;
      const arr = new Array(count).fill(row.id);
      idArr.push(...arr);
    });
    return idArr;
  }, [prizes, useWeight]);

  const rotateDuration = useMemo(() => {
    return isRotating ? duration / 1000 : 0;
  }, [isRotating, duration]);

  const rotateStyle = useMemo(() => {
    return {
      WebkitTransform: `rotateZ(${rotateEndDeg}deg)`,
      transform: `rotateZ(${rotateEndDeg}deg)`,
      WebkitTransitionDuration: `${rotateDuration}s`,
      transitionDuration: `${rotateDuration}s`,
      WebkitTransitionTimingFunction: timingFun,
      transitionTimingFunction: timingFun,
    };
  }, [rotateEndDeg, rotateDuration, timingFun]);

  const rotateBase = useMemo(() => {
    let angle = angleBase * 360;
    if (angleBase < 0) angle -= 360;
    return angle;
  }, [angleBase]);

  const canRotate = useMemo(() => {
    return !disabled && !isRotating && probabilityTotal === 100;
  }, [disabled, isRotating, probabilityTotal]);

  // =========== functions ===========

  /**
   * Whether the total probability of detection is 100
   * @returns {boolean}
   */
  const checkProbability = () => {
    if (probabilityTotal !== 100) {
      throw new Error("Prizes Is Error: Sum of probabilities is not 100!");
    }
    return true;
  };

  /**
   * Draw canvas
   */
  const drawCanvas = () => {
    /**
     * @type {HTMLCanvasElement}
     */
    const canvasEl = canvasRef.current;
    if (canvasEl.getContext) {
      const { radius, textRadius, borderWidth, borderColor, fontSize } =
        canvasConfig;
      // Calculate the circle angle based on the number of prizes
      const arc = Math.PI / (prizes.length / 2);

      /**
       * @type {CanvasRenderingContext2D}
       */
      const ctx = canvasEl.getContext("2d");
      // Clear a rectangle within the given rectangle
      ctx.clearRect(0, 0, radius * 2, radius * 2);
      // strokeStyle : Property sets or returns the color, gradient or pattern used for the stroke
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth * 2;
      // font : Property sets or returns the current font properties of the text content on the canvas
      ctx.font = `${fontSize}px Arial`;
      prizes.forEach((row, i) => {
        const angle = i * arc - Math.PI / 2;
        ctx.fillStyle = row.bgColor;
        ctx.beginPath();
        // arc(x, y, r, starting angle, ending angle, drawing direction)
        // method to create an arc/curve (used to create a circle or part of a circle)
        ctx.arc(
          radius,
          radius,
          radius - borderWidth,
          angle,
          angle + arc,
          false
        );
        ctx.stroke();
        ctx.arc(radius, radius, 0, angle + arc, angle, true);
        ctx.fill();
        // Lock the canvas (in order to save the previous canvas state)
        ctx.save();
        // ----Start drawing prizes----
        ctx.fillStyle = row.color;
        // The translate method remaps the canvas (0, 0) Location
        ctx.translate(
          radius + Math.cos(angle + arc / 2) * textRadius,
          radius + Math.sin(angle + arc / 2) * textRadius
        );
        // The rotate method rotates the current drawing
        drawPrizeText(ctx, angle, arc, row.name);
        // Return (adjust) the current canvas to the previous save() state
        ctx.restore();
        // ----End of drawing prizes----
      });
    }
  };

  /**
   * Draw prize text
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} angle
   * @param {number} arc
   * @param {string} name
   * @returns
   */
  const drawPrizeText = (ctx, angle, arc, name) => {
    const { lineHeight, textLength, textDirection } = canvasConfig;
    // The code below renders different effects based on the type of prize and the length of the prize name,
    // such as font, color, and picture effect.
    // (Specific changes according to actual conditions)
    const content = getStrArray(name, textLength);
    if (content === null) return;
    textDirection === "vertical"
      ? ctx.rotate(angle + arc / 2 + Math.PI)
      : ctx.rotate(angle + arc / 2 + Math.PI / 2);
    content.forEach((text, idx) => {
      let textX = -ctx.measureText(text).width / 2;
      let textY = (idx + 1) * lineHeight;
      if (textDirection === "vertical") {
        textX = 0;
        textY = (idx + 1) * lineHeight - (content.length * lineHeight) / 2;
      }
      ctx.fillText(text, textX, textY);
    });
  };

  const handleClick = () => {
    if (!canRotate) return;
    rotateStart();
    onRotateStart();
  };

  /**
   * Start spinning
   */
  const onRotateStart = () => {
    setIsRotating(true);
    const prizeIdTemp = prizeId || getRandomPrize();
    const rotateEndDegTemp = rotateBase + getTargetDeg(prizeIdTemp);
    setRotateEndDeg(rotateEndDegTemp);
  };

  /**
   * Get the prize id
   */
  const onRotateEnd = () => {
    setIsRotating(false);
    setRotateEndDeg(rotateEndDeg % 360);
    rotateEnd(prizeRes);
  };

  /**
   * Get random prizes id
   * @returns {number}
   */
  const getRandomPrize = () => {
    const len = prizesIdArr.length;
    const prizeId = prizesIdArr[_.random(0, len - 1)];
    return prizeId;
  };

  /**
   * The angle from which the prize is obtained
   * @param {number} prizeId
   * @returns number
   */
  const getTargetDeg = (prizeId) => {
    const absoluteDegCanBeFlexible = 360 / prizes.length / 2;
    const degCanBeFlexible = _.random(
      absoluteDegCanBeFlexible * -1,
      absoluteDegCanBeFlexible
    );
    const angle = 360 / prizes.length;
    const num = prizes.findIndex((row) => row.id === prizeId);
    const prizeResTemp = prizes[num];
    setPrizeRes(prizeResTemp);
    return 360 - (angle * num + angle / 2) + degCanBeFlexible;
  };

  return (
    <Fragment>
      <div className="fw-container">
        <div
          className="fw-wheel"
          style={rotateStyle}
          onTransitionEnd={onRotateEnd}
        >
          {type === "canvas" && (
            <canvas
              ref={canvasRef}
              width={canvasConfig.radius * 2}
              height={canvasConfig.radius * 2}
            />
          )}
          {type !== "canvas" && (
            <img
              alt="wheel"
              src={wheelAsset}
              style={{
                transform: "rotateZ(60deg)",
              }}
            />
          )}
        </div>
        <div className="fw-btn">
          {type === "canvas" && (
            <div
              className="fw-btn__btn"
              style={{
                width: canvasConfig.btnWidth + "px",
                height: canvasConfig.btnWidth + "px",
              }}
              onClick={handleClick}
            >
              {canvasConfig.btnText}
            </div>
          )}
          {type !== "canvas" && (
            <div className="fw-btn__image" onClick={handleClick}>
              <img
                alt="btn"
                src={buttonAsset}
                style={{
                  width: 180,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

FortuneWheel.defaultProps = {
  rotateEnd: () => {},
  rotateStart: () => {},
  type: "canvas",
  canvas: canvasDefaultConfig,
  useWeight: false,
  disabled: false,
  duration: 6000,
  timingFun: "cubic-bezier(0.36, 0.95, 0.64, 1)",
  angleBase: 10,
  prizeId: 0,
  prizes: [],
};

FortuneWheel.propTypes = {
  rotateEnd: PropTypes.func,
  rotateStart: PropTypes.func,
  type: PropTypes.string,
  useWeight: PropTypes.bool,
  disabled: PropTypes.bool,
  verified: PropTypes.bool,
  canvas: PropTypes.object,
  duration: PropTypes.number,
  timingFun: PropTypes.string,
  angleBase: PropTypes.number,
  prizeId: PropTypes.number,
  prizes: PropTypes.array.isRequired,
};

export default FortuneWheel;
