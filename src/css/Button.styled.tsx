import styled from "styled-components";

type TButton = {
  $color?: string;
  $background?: string;
  $active?: boolean;
};

export const RegularButton = styled.button<TButton>`
  font-size: clamp(1rem, calc((var(--normal-text-size-value) - 1) * 2.5vw + 0.5rem), 1.4rem);
  margin: 0.5vmax;
  border: none;
  padding: clamp(6px, 0.5vw, 8px) clamp(12px, 1vw, 16px);
  border-radius: 12px;
  font-weight: 800;
  box-sizing: border-box;
  border: 2px solid ${(props) => {
    if (props.$active && props.$color === "orangered") {
      return "#ff4500";
    }
    return props.$color || "#0272be";
  }};
  min-width: 3vmax;
  background: ${(props) => {
    if (props.$active && props.$color === "orangered" && props.$background === "orangered") {
      return "linear-gradient(135deg, #ff6347 0%, #ff4500 100%)";
    }
    if (props.$background === "#ffd700" || props.$background === "#ffd700") {
      return "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)";
    }
    if (props.$background === "#0057b8" || props.$background === "#0057b8") {
      return "linear-gradient(135deg, #0057b8 0%, #0272be 100%)";
    }
    if (props.$background === "white" || props.$background === "#ffffff") {
      return "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
    }
    if (props.$background === "black" || props.$background === "#000000") {
      return "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)";
    }
    return props.$background ? `linear-gradient(135deg, ${props.$background} 0%, ${props.$background}dd 100%)` : "linear-gradient(135deg, #0272be 0%, #00a8ff 100%)";
  }};
  color: ${(props) => {
    if (props.$active && props.$color === "orangered" && props.$background === "orangered") {
      return "#ffffff";
    }
    if (props.$color === "#0272be" && props.$background === "#0272be") {
      return "#ffffff";
    }
    return props.$color || "#ffffff";
  }};
  box-shadow: ${(props) => {
    if (props.$active && props.$color === "orangered" && props.$background === "orangered") {
      return "0 4px 8px rgba(255, 69, 0, 0.3), 0 2px 4px rgba(255, 69, 0, 0.2)";
    }
    if (props.$color === "#0272be" && props.$background === "#0272be") {
      return "0 4px 8px rgba(2, 114, 190, 0.3), 0 2px 4px rgba(2, 114, 190, 0.2)";
    }
    return "0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)";
  }};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.3px;
  transform: translateY(0);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${(props) => {
      if (props.$active && props.$color === "orangered" && props.$background === "orangered") {
        return "0 6px 16px rgba(255, 69, 0, 0.4), 0 4px 8px rgba(255, 69, 0, 0.3)";
      }
      if (props.$color === "#0272be" && props.$background === "#0272be") {
        return "0 6px 16px rgba(2, 114, 190, 0.4), 0 4px 8px rgba(2, 114, 190, 0.3)";
      }
      if (props.$color === "orangered" && (props.$background === "white" || props.$background === "#ffffff")) {
        return "0 6px 16px rgba(255, 69, 0, 0.4), 0 4px 8px rgba(255, 69, 0, 0.3)";
      }
      return "0 6px 16px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15)";
    }};
    color: ${(props) => {
      if (props.$color === "orangered" && (props.$background === "white" || props.$background === "#ffffff")) {
        return "#ffffff";
      }
      if (props.$active && props.$color === "orangered" && props.$background === "orangered") {
        return "#ffffff";
      }
      if (props.$color === "#0272be" && props.$background === "#0272be") {
        return "#ffffff";
      }
      return props.$color || "#ffffff";
    }};
    border-color: ${(props) => {
      if (props.$active && props.$color === "orangered" && props.$background === "orangered") {
        return "#ff6347";
      }
      if (props.$color === "#0272be" && props.$background === "#0272be") {
        return "#00a8ff";
      }
      if (props.$color === "orangered" && (props.$background === "white" || props.$background === "#ffffff")) {
        return "#ff6347";
      }
      if (props.$color === "#ffd700" || props.$color === "#ffd700") {
        return "#ffed4e";
      }
      if (props.$color === "#0057b8" || props.$color === "#0272be") {
        return "#00a8ff";
      }
      return props.$color || "#00a8ff";
    }};
    background: ${(props) => {
      if (props.$active && props.$color === "orangered" && props.$background === "orangered") {
        return "linear-gradient(135deg, #ff4500 0%, #ff6347 100%)";
      }
      if (props.$color === "#0272be" && props.$background === "#0272be") {
        return "linear-gradient(135deg, #00a8ff 0%, #0272be 100%)";
      }
      if (props.$color === "orangered" && (props.$background === "white" || props.$background === "#ffffff")) {
        return "linear-gradient(135deg, #ff6347 0%, #ff4500 100%)";
      }
      if (props.$background === "#ffd700" || props.$background === "#ffd700") {
        return "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)";
      }
      if (props.$background === "#0057b8" || props.$background === "#0057b8") {
        return "linear-gradient(135deg, #0272be 0%, #0057b8 100%)";
      }
      if (props.$background === "white" || props.$background === "#ffffff") {
        return "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)";
      }
      if (props.$background === "black" || props.$background === "#000000") {
        return "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)";
      }
      return props.$background ? `linear-gradient(135deg, ${props.$background}dd 0%, ${props.$background} 100%)` : "linear-gradient(135deg, #00a8ff 0%, #0272be 100%)";
    }};
    filter: brightness(1.1);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    filter: brightness(0.95);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    filter: grayscale(0.3);
    
    &:hover {
      transform: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(2, 114, 190, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  @media screen and (max-width: 767px) {
    font-size: clamp(0.85rem, 2vw, 1rem);
    padding: clamp(4px, 0.4vw, 6px) clamp(8px, 0.8vw, 12px);
    margin: 0.3vmax;
    min-width: 2.5vmax;
  }
  
  @media screen and (min-width: 768px) and (max-width: 1024px) {
    font-size: clamp(0.9rem, 1.8vw, 1.1rem); /* Адаптация для iPad */
    padding: clamp(5px, 0.45vw, 7px) clamp(10px, 0.9vw, 14px);
    margin: 0.4vmax;
    min-width: 2.8vmax;
  }
`;
