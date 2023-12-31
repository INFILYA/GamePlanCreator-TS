import styled from "styled-components";

type TButton = {
  $color?: string;
  $background?: string;
};

export const RegularButton = styled.button<TButton>`
  font-size: calc((var(--normal-text-size-value) - 1) * 3vmax + 0.2rem);
  margin: 0.5vmax;
  border: none;
  padding: 0.33vmax 0.5vmax;
  border-radius: 5px;
  font-weight: bold;
  box-sizing: border-box;
  border: 2px solid;
  min-width: 3vmax;
  background-color: ${(props) => props.$background};
  color: ${(props) => props.$color};
  white-space: nowrap;
  overflow: hidden;
  &:hover {
    transition: 0.5s;
    opacity: 1;
    scale: 1.15;
    cursor: pointer;
    color: ${(props) => props.$background};
    background-color: ${(props) => props.$color};
  }
`;
